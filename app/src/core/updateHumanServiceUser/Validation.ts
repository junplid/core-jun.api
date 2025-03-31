import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateHumanServiceUserBodyDTO_I,
  UpdateHumanServiceUserQueryDTO_I,
} from "./DTO";

export const updateHumanServiceUserValidation = (
  req: Request<
    any,
    any,
    UpdateHumanServiceUserBodyDTO_I,
    UpdateHumanServiceUserQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string(),
    password: Joi.string(),
    username: Joi.string(),
    userId: Joi.number().required(),
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
