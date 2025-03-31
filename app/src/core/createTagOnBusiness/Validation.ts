import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateTagOnBusinessDTO_I } from "./DTO";

export const createTagOnBusinessValidation = (
  req: Request<any, any, CreateTagOnBusinessDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).required(),
    type: Joi.string()
      .regex(/(audience|contactwa)/)
      .required(),
    subUserUid: Joi.string().optional(),
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
