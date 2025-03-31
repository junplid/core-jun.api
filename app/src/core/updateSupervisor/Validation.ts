import { Joi } from "express-validation";
import { Request, Response, NextFunction } from "express";
import {
  UpdateSupervisorBodyDTO_I,
  UpdateSupervisorParamsDTO_I,
  UpdateSupervisorQueryDTO_I,
} from "./DTO";

export const updateSupervisorValidation = (
  req: Request<
    UpdateSupervisorParamsDTO_I,
    any,
    UpdateSupervisorBodyDTO_I,
    UpdateSupervisorQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string().optional(),
    password: Joi.string().optional(),
    username: Joi.string().optional(),
    businessIds: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
    sectorIds: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.query, ...req.params, ...req.body },
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

  if (req.query.sectorIds) {
    req.query.sectorIds = String(req.query.sectorIds)
      .split("-")
      .map((s) => Number(s));
  }

  req.params.id = Number(req.params.id);
  next();
};
