import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateStaticFileDTO_I } from "./DTO";

export const createStaticFileValidation = (
  req: Request<any, any, CreateStaticFileDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    type: Joi.string()
      .regex(/(video|image|pdf|file|audio)/)
      .required(),
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    size: Joi.number().required(),
    originalName: Joi.string().required(),
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
