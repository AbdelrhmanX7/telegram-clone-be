import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import authRoute from "./auth/router";
import conversationRoute from "./conversation/router";
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

router.use(conversationRoute);

export default router;
