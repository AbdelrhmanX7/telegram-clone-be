import express, { Request, Response } from "express";
import { loginValidationHandler, registerValidationHandler } from "./handler";
import UserController from "../../controllers/user.controller";
const router = express.Router();

router.post(
  "/register",
  registerValidationHandler,
  async (req: Request, res: Response) => {
    const controller = new UserController();

    try {
      const { token, user } = await controller.createAccount(req);
      res.status(200).send({ token, user });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
);

router.post(
  "/login",
  loginValidationHandler,
  async (req: Request, res: Response) => {
    const controller = new UserController();

    try {
      const { token, user } = await controller.login(req);
      res.status(200).send({ token, user });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
);

export default router;
