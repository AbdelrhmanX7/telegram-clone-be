import express, { Request, Response } from "express";
import Conversations from "../../models/conversations";
import { Types } from "mongoose";
import Messages from "../../models/messages";
import { getConversationValidationHandler } from "./handler";
import UserController from "../../controllers/user.controller";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const { userId: _id }: any = jwt.decode(token ?? "") ?? "";
    const userId = new Types.ObjectId(_id);
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
    ]);

    const dataFormater = getAllConversations.map((item) => ({
      ...item.users[0],
      _id: item._id,
    }));

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
      const token = req.headers.authorization;
      const { userId: _id }: any = jwt.decode(token ?? "") ?? "";
      const userId = new Types.ObjectId(_id);
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
      ]);

      const dataFormater = getAllConversations.map((item) => ({
        ...item.users[0],
      }));

      const { conversationId, page } = req.query;
      const pageSize = 25;
      const conversation = await Messages.aggregate([
        { $match: { conversationId } },
        { $skip: (Number(page) - 1) * pageSize },
        { $limit: pageSize },
      ]);

      res.status(200).send({
        user: dataFormater[0],
        messages: conversation,
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
