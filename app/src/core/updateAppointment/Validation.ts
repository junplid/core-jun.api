import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateAppointmentBodyDTO_I,
  UpdateAppointmentParamsDTO_I,
  UpdateAppointmentQueryDTO_I,
} from "./DTO";

export const updateAppointmentValidation = (
  req: Request<
    UpdateAppointmentParamsDTO_I,
    any,
    UpdateAppointmentBodyDTO_I,
    UpdateAppointmentQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().optional(),
    desc: Joi.string().optional(),
    startAt: Joi.date().optional(),
    status: Joi.string().valid([
      "suggested",
      "pending_confirmation",
      "confirmed",
      "canceled",
      "completed",
      "expired",
    ]),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
    { abortEarly: false },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = Number(req.params.id);
  req.body.accountId = req.user?.id!;
  next();
};
