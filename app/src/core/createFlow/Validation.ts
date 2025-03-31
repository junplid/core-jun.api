import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateFlowDTO_I } from "./DTO";

export const createFlowValidation = (
  req: Request<any, any, CreateFlowDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
    businessIds: Joi.array().items(Joi.number()).required(),
    name: Joi.string().required(),
    type: Joi.string()
      .regex(/(chatbot|marketing)/)
      .required(),
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
