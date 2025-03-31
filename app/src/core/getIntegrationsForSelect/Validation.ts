import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetIntegrationsForSelectBodyDTO_I,
  GetIntegrationsForSelectQueryDTO_I,
} from "./DTO";

export const getIntegrationsForSelectValidation = (
  req: Request<
    any,
    any,
    GetIntegrationsForSelectBodyDTO_I,
    GetIntegrationsForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    type: Joi.string()
      .regex(/^(trello)$/)
      .required(),
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
