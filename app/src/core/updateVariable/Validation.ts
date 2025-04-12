import { NextFunction, Request, Response } from "express";
import {
  UpdateVariableBodyDTO_I,
  UpdateVariableParamsDTO_I,
  UpdateVariableQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const updateVariableValidation = (
  req: Request<
    UpdateVariableParamsDTO_I,
    any,
    UpdateVariableBodyDTO_I,
    UpdateVariableQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    value: Joi.string(),
    name: Joi.string(),
    businessIds: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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
  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((s) => Number(s));
  }
  next();
};
