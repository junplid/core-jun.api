import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateTagContactHumanServiceDTO_I } from "./DTO";

export const createTagContactHumanServiceValidation = (
  req: Request<any, any, CreateTagContactHumanServiceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    list: Joi.array().items(Joi.number()).required(),
    userId: Joi.number().required(),
    ticketId: Joi.number().required(),
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
