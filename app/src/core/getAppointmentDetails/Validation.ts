import { NextFunction, Request, Response } from "express";
import {
  GetAppointmentDetailsBodyDTO_I,
  GetAppointmentDetailsParamsDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getAppointmentDetailsValidation = (
  req: Request<
    GetAppointmentDetailsParamsDTO_I,
    any,
    GetAppointmentDetailsBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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
  req.params.id = rest.id;
  next();
};
