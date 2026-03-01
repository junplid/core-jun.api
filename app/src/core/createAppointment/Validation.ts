import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateAppointmentDTO_I } from "./DTO";

export const createAppointmentValidation = (
  req: Request<any, any, CreateAppointmentDTO_I, any>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    title: Joi.string().required(),
    desc: Joi.string().optional(),
    socketIgnore: Joi.string().optional(),
    dateStartAt: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    timeStartAt: Joi.string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    endAt: Joi.valid(
      "10min",
      "30min",
      "1h",
      "1h e 30min",
      "2h",
      "3h",
      "4h",
      "5h",
      "10h",
      "15h",
      "1d",
      "2d",
    ).required(),
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

  req.body.accountId = req.user?.id!;
  next();
};
