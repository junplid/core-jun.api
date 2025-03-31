import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetGeolocationHumanServiceForSelectBodyDTO_I,
  GetGeolocationHumanServiceForSelectQueryDTO_I,
} from "./DTO";

export const getGeolocationHumanServiceForSelectValidation = (
  req: Request<
    any,
    any,
    GetGeolocationHumanServiceForSelectBodyDTO_I,
    GetGeolocationHumanServiceForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    name: Joi.string().allow(""),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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
