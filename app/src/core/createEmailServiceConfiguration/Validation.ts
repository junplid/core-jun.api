import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateEmailServiceConfigurationDTO_I } from "./DTO";

export const createEmailServiceConfigurationValidation = (
  req: Request<any, any, CreateEmailServiceConfigurationDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    host: Joi.string().required(),
    subUserUid: Joi.string().optional(),
    port: Joi.number().required(),
    pass: Joi.string().required(),
    user: Joi.string().required(),
    secure: Joi.boolean(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).required(),
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
