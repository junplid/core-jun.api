import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetNotificationsHumanServiceDTO_I } from "./DTO";

export const getNotificationsHumanServiceValidation = (
  req: Request<any, any, GetNotificationsHumanServiceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
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
