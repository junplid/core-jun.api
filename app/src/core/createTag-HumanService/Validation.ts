import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateTagHumanServiceDTO_I } from "./DTO";

export const createTagHumanServiceValidation = (
  req: Request<any, any, CreateTagHumanServiceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    userId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail: any) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  next();
};
