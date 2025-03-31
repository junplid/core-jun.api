import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateSectorAttendantOnHumanServiceBodyDTO_I,
  UpdateSectorAttendantOnHumanServiceQueryDTO_I,
} from "./DTO";

export const updateSectorAttendantOnHumanServiceValidation = (
  req: Request<
    any,
    any,
    UpdateSectorAttendantOnHumanServiceBodyDTO_I,
    UpdateSectorAttendantOnHumanServiceQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    name: Joi.string(),
    password: Joi.string(),
    username: Joi.string(),
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

  next();
};
