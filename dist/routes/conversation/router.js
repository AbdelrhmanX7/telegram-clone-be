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
const conversations_1 = __importDefault(require("../../models/conversations"));
const mongoose_1 = require("mongoose");
const messages_1 = __importDefault(require("../../models/messages"));
const handler_1 = require("./handler");
const user_controller_1 = __importDefault(require("../../controllers/user.controller"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../../models/users"));
const router = express_1.default.Router();
router.get("/conversations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = new mongoose_1.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.userId) !== null && _a !== void 0 ? _a : "");
        const getAllConversations = yield conversations_1.default.aggregate([
            { $match: { userIds: userId } },
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
                            cond: { $ne: ["$$user._id", userId] },
                        },
                    },
                },
            },
            {
                $project: {
                    users: {
                        password: 0,
                    },
                },
            },
        ]);
        const conversationIds = getAllConversations.map((item) => new mongoose_1.Types.ObjectId(item._id));
        const getLastMessage = yield messages_1.default.aggregate([
            {
                $match: {
                    conversationId: { $in: conversationIds },
                },
            },
            {
                $sort: {
                    conversationId: 1,
                    timestamp: -1,
                },
            },
            {
                $group: {
                    _id: "$conversationId",
                    latestMessage: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: { newRoot: "$latestMessage" },
            },
            {
                $project: {
                    _id: 0,
                    senderId: 0,
                    reveiverId: 0,
                },
            },
        ]);
        const dataFormater = getAllConversations.map((item) => {
            const messageInfo = getLastMessage === null || getLastMessage === void 0 ? void 0 : getLastMessage.find((msg) => { var _a, _b; return ((_a = msg === null || msg === void 0 ? void 0 : msg.conversationId) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = item === null || item === void 0 ? void 0 : item._id) === null || _b === void 0 ? void 0 : _b.toString()); });
            return Object.assign(Object.assign(Object.assign({}, item.users[0]), messageInfo), { conversationId: item._id });
        });
        res.status(200).send(dataFormater);
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
}));
router.get("/conversation", handler_1.getConversationValidationHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    try {
        const query = req.query;
        const user = yield users_1.default.findById(new mongoose_1.Types.ObjectId(query === null || query === void 0 ? void 0 : query.userId));
        const pageSize = 100;
        const token = (_c = (_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.authorization) !== null && _c !== void 0 ? _c : "";
        const { userId } = jsonwebtoken_1.default.decode(token !== null && token !== void 0 ? token : "");
        const conv = yield conversations_1.default.findOne({
            userIds: { $all: [new mongoose_1.Types.ObjectId(userId), user === null || user === void 0 ? void 0 : user._id] },
        });
        const conversation = yield messages_1.default.aggregate([
            {
                $match: { conversationId: conv === null || conv === void 0 ? void 0 : conv._id },
            },
            { $skip: (Number(query.page) - 1) * pageSize },
            { $limit: pageSize },
        ]);
        res.status(200).send({
            user,
            messages: conversation,
            conversationId: (_d = conversation[0]) === null || _d === void 0 ? void 0 : _d.conversationId,
        });
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
}));
router.get("/get-users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new user_controller_1.default();
    try {
        const users = yield controller.getUsers(req);
        res.status(200).send({ users });
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
}));
exports.default = router;
