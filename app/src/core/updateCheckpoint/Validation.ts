import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateCheckpointBodyDTO_I,
  UpdateCheckpointParamsDTO_I,
  UpdateCheckpointQueryDTO_I,
} from "./DTO";

export const updateCheckpointValidation = (
  req: Request<
    UpdateCheckpointParamsDTO_I,
    any,
    UpdateCheckpointBodyDTO_I,
    UpdateCheckpointQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()),
    accountId: Joi.number().required(),
    name: Joi.string(),
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

  next();
};
