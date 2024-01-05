import express from "express";
import { Connect } from "./config";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import messages from "./models/messages";
import Conversations from "./models/conversations";
import Users from "./models/users";
import { Types } from "mongoose";
// import multer from "multer";
// import stream from "stream";
// import { google } from "googleapis";
// import path from "path";

dotenv.config();
Connect();
// const upload = multer();

// const KEYFILEPATH = path.join(__dirname, "google-credentials.json");
// const SCOPES = ["https://www.googleapis.com/auth/drive"];

// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.get("/", (req, res) => {
//   res.sendFile(`${__dirname}/index.html`);
// });
// app.post("/upload", upload.any(), async (req: any, res) => {
//   try {
//     console.log(req.body);
//     console.log(req.files);
//     const { body, files } = req;

//     for (let f = 0; f < files.length; f += 1) {
//       await uploadFile(files[f]);
//     }

//     res.status(200).send("Form Submitted");
//   } catch (f: any) {
//     res.send(f.message);
//   }
// });

// const uploadFile = async (fileObject: any) => {
//   const bufferStream = new stream.PassThrough();
//   bufferStream.end(fileObject.buffer);
//   const { data } = await google.drive({ version: "v3", auth }).files.create({
//     media: {
//       mimeType: fileObject.mimeType,
//       body: bufferStream,
//     },
//     requestBody: {
//       name: fileObject.originalname,
//       parents: ["1dR1oQ_OdwCofG0lWwjTUMju8-FE3dpai"],
//     },
//     fields: "id,name",
//   });
//   console.log(`Uploaded file ${data.name} ${data.id}`);
// };

app.use(router);

const connectedUsers: any = {};

io.on("connection", (socket) => {
  socket.on("disconnect", async () => {
    const disconnectedUserId = connectedUsers[socket.id]?.userId;
    delete connectedUsers[socket.id];

    await Users.findByIdAndUpdate(disconnectedUserId, {
      isActive: false,
      lastSeenAt: new Date(),
    });
    const getAllConversations = await Conversations.aggregate([
      { $match: { userIds: new Types.ObjectId(disconnectedUserId) } },
      {
        $lookup: {
          from: "users",
          localField: "userIds",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $project: {
          users: {
            $filter: {
              input: "$users",
              as: "user",
              cond: {
                $ne: ["$$user._id", new Types.ObjectId(disconnectedUserId)],
              },
            },
          },
        },
      },
    ]);
    getAllConversations.forEach((conversation) => {
      io.to(conversation.users[0]._id.toString()).emit(
        "user_disconnect",
        conversation._id
      );
    });
  });
  socket.on("init", async (id) => {
    // id --> senderId (userId)
    if (id?.length) {
      socket.join(id);
      connectedUsers[socket.id] = { userId: id };
      await Users.findByIdAndUpdate(id, {
        isActive: true,
      });

      const getAllConversations = await Conversations.aggregate([
        { $match: { userIds: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            localField: "userIds",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $project: {
            users: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user._id", new Types.ObjectId(id)] },
              },
            },
          },
        },
      ]);

      getAllConversations.forEach((conversation) => {
        io.to(conversation.users[0]._id.toString()).emit(
          "user_connect",
          conversation._id
        );
      });

      const conv: any = await Conversations.find({
        userIds: { $in: [new Types.ObjectId(id)] },
      });
      const convIds = conv.map((item: any) => new Types.ObjectId(item._id));
      await messages.updateMany(
        {
          conversationId: { $in: convIds },
          receiverId: id,
          messageState: "sent",
        },
        { messageState: "received" }
      );

      socket.on("typing", async (data) => {
        if (!data?.conversationId || !data?.receiverId || !data?.senderId) {
          io.emit("err");
        } else {
          const { senderId, receiverId, isTyping, conversationId } = data;
          io.to(receiverId).emit("typing", {
            senderId,
            isTyping,
            conversationId,
          });
        }
      });

      socket.on(
        "message:seen",
        async ({ conversationId, senderId, receiverId }) => {
          await messages.updateMany(
            {
              conversationId: { $in: conversationId },
              receiverId: senderId,
              senderId: receiverId,
              $or: [{ messageState: "sent" }, { messageState: "received" }],
            },
            { messageState: "seen" }
          );
          io.to(senderId).emit("seen:message");
          io.to(receiverId).emit("seen:message");
        }
      );

      socket.on("message:received", async (messageForm, isSeen = false) => {
        messageForm.messageState = isSeen ? "seen" : "received";
        const { senderId, receiverId } = messageForm;
        io.to(senderId).emit("direct:message", messageForm);
        io.to(receiverId).emit(
          isSeen ? "direct:message" : "incoming:message",
          messageForm
        );
        await messages.create(messageForm);
      });

      socket.on("message", async (msg) => {
        let messageState = "sent";

        if (
          !msg?.message?.length ||
          !msg?.senderId?.length ||
          !msg?.receiverId?.length
        ) {
          io.emit("message", "error");
        } else {
          let isFirstMsg = false;

          const { message, senderId, receiverId } = msg;
          let conversationId = msg?.conversationId;
          if (!conversationId?.length) {
            isFirstMsg = true;
            const conv: any = await Conversations.create({
              userIds: [senderId, receiverId],
            });
            conversationId = conv._id;
          }

          const messageForm = {
            message,
            senderId,
            receiverId,
            conversationId,
            isFirstMsg,
            timestamp: new Date(),
            messageState,
          };
          try {
            const respone = await socket
              .timeout(5000)
              .to(receiverId)
              .emitWithAck("receive:message", messageForm);
            if (!respone[0]?.status) {
              messageForm.messageState = "sent";
              const { senderId } = messageForm;
              io.to(senderId).emit("direct:message", messageForm);
              await messages.create(messageForm);
            }
          } catch (error) {}
        }
      });
    }
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server running at ==> http://localhost:${process.env.PORT}`)
);
