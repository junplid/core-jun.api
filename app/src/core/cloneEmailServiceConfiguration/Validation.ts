import { NextFunction, Request, Response } from "express";
import {
  CloneEmailServiceConfigurationParamsDTO_I,
  CloneEmailServiceConfigurationBodyDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const cloneEmailServiceConfigurationValidation = (
  req: Request<
    CloneEmailServiceConfigurationParamsDTO_I,
    any,
    CloneEmailServiceConfigurationBodyDTO_I
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

  req.params.id = Number(req.params.id);
  next();
};
