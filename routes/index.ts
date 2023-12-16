import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import authRoute from "./auth/router";
import { getUsersValidationHandler } from "./auth/handler";
import UserController from "../controllers/user.controller";
const router = express.Router();

router.use(authRoute);

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req?.headers?.authorization ?? "";
  const SECRET_KEY = process?.env?.SECRET_KEY ?? "";
  if (token) {
    jwt.verify(token, SECRET_KEY, (err) => {
      if (err) res.status(401).send({ message: "Unauthorized" });
      next();
    });
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});

router.get(
  "/get-users",
  getUsersValidationHandler,
  async (req: Request, res: Response) => {
    const controller = new UserController();
    try {
      const users = await controller.getUsers(req);
      res.status(200).send({ users });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
);

export default router;
