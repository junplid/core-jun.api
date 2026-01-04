import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreatePushTokenDTO_I } from "./DTO";

export const createPushTokenValidation = (
  req: Request<any, any, CreatePushTokenDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    token: Joi.string().required(),
    platform: Joi.string().required(),
    accountId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  next();
};
