import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateFacebookIntegrationBodyDTO_I,
  UpdateFacebookIntegrationParamsDTO_I,
  UpdateFacebookIntegrationQueryDTO_I,
} from "./DTO";

export const updateFacebookIntegrationValidation = (
  req: Request<
    UpdateFacebookIntegrationParamsDTO_I,
    any,
    UpdateFacebookIntegrationBodyDTO_I,
    UpdateFacebookIntegrationQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    access_token: Joi.string().allow(""),
    name: Joi.string().allow(""),
    status: Joi.string().valid("false", "true").allow(""),
    description: Joi.string().allow(""),
    businessIds: Joi.string()
      .regex(/^\d+(-\d+)*$/)
      .allow("")
      .optional(),
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

  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map(Number);
  }

  if (req.query.status) {
    req.query.status = !!(String(req.query.status) === "true");
  }

  req.params.id = Number(req.params.id);

  next();
};
