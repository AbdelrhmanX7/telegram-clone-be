"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const messages_1 = __importDefault(require("./models/messages"));
const conversations_1 = __importDefault(require("./models/conversations"));
const users_1 = __importDefault(require("./models/users"));
const mongoose_1 = require("mongoose");
// import multer from "multer";
// import stream from "stream";
// import { google } from "googleapis";
// import path from "path";
dotenv_1.default.config();
(0, config_1.Connect)();
// const upload = multer();
// const KEYFILEPATH = path.join(__dirname, "google-credentials.json");
// const SCOPES = ["https://www.googleapis.com/auth/drive"];
// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use(routes_1.default);
const connectedUsers = {};
io.on("connection", (socket) => {
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const disconnectedUserId = (_a = connectedUsers[socket.id]) === null || _a === void 0 ? void 0 : _a.userId;
        delete connectedUsers[socket.id];
        yield users_1.default.findByIdAndUpdate(disconnectedUserId, {
            isActive: false,
            lastSeenAt: new Date(),
        });
        const getAllConversations = yield conversations_1.default.aggregate([
            { $match: { userIds: new mongoose_1.Types.ObjectId(disconnectedUserId) } },
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
                                $ne: ["$$user._id", new mongoose_1.Types.ObjectId(disconnectedUserId)],
                            },
                        },
                    },
                },
            },
        ]);
        getAllConversations.forEach((conversation) => {
            io.to(conversation.users[0]._id.toString()).emit("user_disconnect", conversation._id);
        });
    }));
    socket.on("init", (id) => __awaiter(void 0, void 0, void 0, function* () {
        // id --> senderId (userId)
        if (id === null || id === void 0 ? void 0 : id.length) {
            socket.join(id);
            connectedUsers[socket.id] = { userId: id };
            yield users_1.default.findByIdAndUpdate(id, {
                isActive: true,
            });
            const getAllConversations = yield conversations_1.default.aggregate([
                { $match: { userIds: new mongoose_1.Types.ObjectId(id) } },
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
                                cond: { $ne: ["$$user._id", new mongoose_1.Types.ObjectId(id)] },
                            },
                        },
                    },
                },
            ]);
            getAllConversations.forEach((conversation) => {
                io.to(conversation.users[0]._id.toString()).emit("user_connect", conversation._id);
            });
            const conv = yield conversations_1.default.find({
                userIds: { $in: [new mongoose_1.Types.ObjectId(id)] },
            });
            const convIds = conv.map((item) => new mongoose_1.Types.ObjectId(item._id));
            yield messages_1.default.updateMany({
                conversationId: { $in: convIds },
                receiverId: id,
                messageState: "sent",
            }, { messageState: "received" });
            socket.on("typing", (data) => __awaiter(void 0, void 0, void 0, function* () {
                if (!(data === null || data === void 0 ? void 0 : data.conversationId) || !(data === null || data === void 0 ? void 0 : data.receiverId) || !(data === null || data === void 0 ? void 0 : data.senderId)) {
                    io.emit("err");
                }
                else {
                    const { senderId, receiverId, isTyping, conversationId } = data;
                    io.to(receiverId).emit("typing", {
                        senderId,
                        isTyping,
                        conversationId,
                    });
                }
            }));
            socket.on("message:seen", ({ conversationId, senderId, receiverId }) => __awaiter(void 0, void 0, void 0, function* () {
                yield messages_1.default.updateMany({
                    conversationId: { $in: conversationId },
                    receiverId: senderId,
                    senderId: receiverId,
                    $or: [{ messageState: "sent" }, { messageState: "received" }],
                }, { messageState: "seen" });
                io.to(senderId).emit("seen:message");
                io.to(receiverId).emit("seen:message");
            }));
            socket.on("message:received", (messageForm, isSeen = false) => __awaiter(void 0, void 0, void 0, function* () {
                messageForm.messageState = isSeen ? "seen" : "received";
                const { senderId, receiverId } = messageForm;
                io.to(senderId).emit("direct:message", messageForm);
                io.to(receiverId).emit(isSeen ? "direct:message" : "incoming:message", messageForm);
                yield messages_1.default.create(messageForm);
            }));
            socket.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
                var _b, _c, _d, _e;
                let messageState = "sent";
                if (!((_b = msg === null || msg === void 0 ? void 0 : msg.message) === null || _b === void 0 ? void 0 : _b.length) ||
                    !((_c = msg === null || msg === void 0 ? void 0 : msg.senderId) === null || _c === void 0 ? void 0 : _c.length) ||
                    !((_d = msg === null || msg === void 0 ? void 0 : msg.receiverId) === null || _d === void 0 ? void 0 : _d.length)) {
                    io.emit("message", "error");
                }
                else {
                    let isFirstMsg = false;
                    const { message, senderId, receiverId } = msg;
                    let conversationId = msg === null || msg === void 0 ? void 0 : msg.conversationId;
                    if (!(conversationId === null || conversationId === void 0 ? void 0 : conversationId.length)) {
                        isFirstMsg = true;
                        const conv = yield conversations_1.default.create({
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
                        const respone = yield socket
                            .timeout(5000)
                            .to(receiverId)
                            .emitWithAck("receive:message", messageForm);
                        if (!((_e = respone[0]) === null || _e === void 0 ? void 0 : _e.status)) {
                            messageForm.messageState = "sent";
                            const { senderId } = messageForm;
                            io.to(senderId).emit("direct:message", messageForm);
                            yield messages_1.default.create(messageForm);
                        }
                    }
                    catch (error) { }
                }
            }));
        }
    }));
});
server.listen(process.env.PORT, () => console.log(`Server running at ==> http://localhost:${process.env.PORT}`));
