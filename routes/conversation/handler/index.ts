import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const getConversationValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    page: Joi.string().required(),
    userId: Joi.string().required(),
  });

  const validateResult = schema.validate(req.query);

  if (validateResult.error) {
    return res.status(400).send({ message: validateResult.error.message });
  }

  next();
};
