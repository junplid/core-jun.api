import { NextFunction, query, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateEmailServiceConfigurationBodyDTO_I,
  UpdateEmailServiceConfigurationParamsDTO_I,
  UpdateEmailServiceConfigurationQueryDTO_I,
} from "./DTO";

export const updateEmailServiceConfigurationValidation = (
  req: Request<
    UpdateEmailServiceConfigurationParamsDTO_I,
    any,
    UpdateEmailServiceConfigurationBodyDTO_I,
    UpdateEmailServiceConfigurationQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  console.log(req.query);
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    businessIds: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
    host: Joi.string(),
    port: Joi.number(),
    user: Joi.string(),
    pass: Joi.string(),
    secure: Joi.string().valid("true", "false"),
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

  req.params.id = Number(req.params.id);
  if (req.query.businessIds?.length) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((s) => Number(s));
  }
  if (req.query.secure) req.query.secure = JSON.parse(String(req.query.secure));
  if (req.query.port) req.query.port = Number(req.query.port);

  next();
};
