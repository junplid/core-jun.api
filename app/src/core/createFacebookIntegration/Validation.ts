import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateFacebookIntegrationDTO_I } from "./DTO";

export const createFacebookIntegrationValidation = (
  req: Request<any, any, CreateFacebookIntegrationDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    description: Joi.string(),
    access_token: Joi.string(),
    status: Joi.boolean(),
    businessIds: Joi.array().items(Joi.number()).min(1).required(),
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
