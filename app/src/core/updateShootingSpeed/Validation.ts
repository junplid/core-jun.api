import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateShootingSpeedBodyDTO_I,
  UpdateShootingSpeedBodyQueryDTO_I,
  UpdateShootingSpeedParamsDTO_I,
} from "./DTO";
import { time } from "console";

export const updateShootingSpeedValidation = (
  req: Request<
    UpdateShootingSpeedParamsDTO_I,
    any,
    UpdateShootingSpeedBodyDTO_I,
    UpdateShootingSpeedBodyQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    rootId: Joi.number().required(),
    name: Joi.string().allow("").optional(),
    timeBetweenShots: Joi.number().optional(),
    timeRest: Joi.number().optional(),
    numberShots: Joi.number().optional(),
    sequence: Joi.number().optional(),
    status: Joi.boolean().optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
    { abortEarly: false }
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      text: detail.message,
      path: detail.path.join("."),
    }));
    return res.status(400).json({ input: errors });
  }

  const { id, rootId, ...query } = validation.value;

  req.params.id = Number(req.params.id);
  req.body.rootId = Number(req.body.rootId);
  req.query = query as UpdateShootingSpeedBodyQueryDTO_I;

  next();
};
