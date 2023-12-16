import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const registerValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(30).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().min(11).max(11).required(),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    const errors = validationResult.error.details.map((err) => err.message);
    return res.status(400).send({ errors });
  }

  next();
};

export const loginValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    const errors = validationResult.error.details.map((err) => err.message);
    return res.status(400).send({ errors });
  }

  next();
};

export const getUsersValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    page: Joi.string().required(),
    search: Joi.string().required(),
  });

  const validationResult = schema.validate(req.query);

  if (validationResult.error) {
    const errors = validationResult.error.details.map((err) => err.message);
    return res.status(400).send({ errors });
  }

  next();
};
