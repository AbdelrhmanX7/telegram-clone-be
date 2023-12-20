import express from "express";
import { Connect } from "./config";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import messages from "./models/messages";
import Conversations from "./models/conversations";
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

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("init", (id) => {
    if (id?.length) {
      socket.join(id);
      socket.on("message", async (data) => {
        const convertData = JSON.parse(data);
        if (
          !convertData?.message?.length ||
          !convertData?.senderId?.length ||
          !convertData?.receiverId?.length
        ) {
          io.emit("message", "error");
        } else {
          const { message, senderId, receiverId } = convertData;
          let conversationId = convertData?.conversationId;
          if (!conversationId?.length) {
            const conv: any = await Conversations.create({
              userIds: [senderId, receiverId],
            });
            conversationId = conv._id;
          }
          await messages.create({
            message,
            senderId,
            receiverId,
            conversationId,
          });
          io.to(senderId).emit("message", message);
          io.to(receiverId).emit("message", message);
        }
      });
    }
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server running at ==> http://localhost:${process.env.PORT}`)
);
