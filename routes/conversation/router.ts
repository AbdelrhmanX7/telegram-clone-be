import express, { Request, Response, Router } from "express";
import Conversations from "../../models/conversations";
import { Types } from "mongoose";
import Messages from "../../models/messages";
import { getConversationValidationHandler } from "./handler";
import UserController from "../../controllers/user.controller";
import jwt from "jsonwebtoken";
import Users from "../../models/users";
const router = express.Router();

router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req?.userId ?? "");
    const getAllConversations = await Conversations.aggregate([
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
    const conversationIds = getAllConversations.map(
      (item) => new Types.ObjectId(item._id)
    );
    const getLastMessage = await Messages.aggregate([
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
      const messageInfo = getLastMessage?.find(
        (msg) => msg?.conversationId?.toString() === item?._id?.toString()
      );

      return {
        ...item.users[0],
        ...messageInfo,
        conversationId: item._id,
      };
    });

    res.status(200).send(dataFormater);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

router.get(
  "/conversation",
  getConversationValidationHandler,
  async (req: Request, res: Response) => {
    try {
      const query: any = req.query;
      const user: any = await Users.findById(new Types.ObjectId(query?.userId));
      const pageSize = 100;
      const token = req?.headers?.authorization ?? "";
      const { userId }: any = jwt.decode(token ?? "");
      const conv: any = await Conversations.findOne({
        userIds: { $all: [new Types.ObjectId(userId), user?._id] },
      });
      const conversation = await Messages.aggregate([
        {
          $match: { conversationId: conv?._id },
        },
        { $skip: (Number(query.page) - 1) * pageSize },
        { $limit: pageSize },
      ]);

      res.status(200).send({
        user,
        messages: conversation,
        conversationId: conversation[0]?.conversationId,
      });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
);

router.get("/get-users", async (req: Request, res: Response) => {
  const controller = new UserController();
  try {
    const users = await controller.getUsers(req);
    res.status(200).send({ users });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
