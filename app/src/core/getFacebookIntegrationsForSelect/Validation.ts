import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetFacebookIntegrationsForSelectBodyDTO_I,
  GetFacebookIntegrationsForSelectQueryDTO_I,
} from "./DTO";

export const getFacebookIntegrationsForSelectValidation = (
  req: Request<
    any,
    any,
    GetFacebookIntegrationsForSelectBodyDTO_I,
    GetFacebookIntegrationsForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    businessIds: Joi.string()
      .regex(/^\d+(-\d+)*$/)
      .allow("")
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

  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((s) => Number(s));
  }

  next();
};
