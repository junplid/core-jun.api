import { NextFunction, Request, Response } from "express";
import { GetAppointmentsBodyDTO_I, GetAppointmentsQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getAppointmentsValidation = (
  req: Request<any, any, GetAppointmentsBodyDTO_I, GetAppointmentsQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    limit: Joi.number().min(1).optional(),
    status: Joi.array()
      .items(
        Joi.string().valid(
          "suggested",
          "pending_confirmation",
          "confirmed",
          "canceled",
          "completed",
          "expired"
        )
      )
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
    { abortEarly: false }
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  const { account, ...rest } = validation.value;
  req.query = rest;

  next();
};
