import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdatePlanBodyDTO_I,
  UpdatePlanParamsDTO_I,
  UpdatePlanQueryDTO_I,
} from "./DTO";

export const updatePlanValidation = (
  req: Request<
    UpdatePlanParamsDTO_I,
    any,
    UpdatePlanBodyDTO_I,
    UpdatePlanQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    acceptsNewUsers: Joi.string().valid("0", "1").optional(),
    activeFoSubscribers: Joi.string().valid("0", "1").optional(),
    allowsRenewal: Joi.string().valid("0", "1").optional(),
    rootId: Joi.number().required(),
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

  next();
};
