import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const extractUserIdFromToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization ?? "";
    if (!token?.length) throw new Error("Authorization token missing");
    const decodedToken = <jwt.UserIDJwtPayload>jwt.decode(token);
    if (!decodedToken || !decodedToken?.userId) {
      throw new Error("Invalid token or missing user ID");
    }
    req.userId = decodedToken.userId;
    next();
  } catch (error: any) {
    res.status(401).send({ message: error?.message ?? "Unauthorized" });
  }
};
