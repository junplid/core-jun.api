import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateFunnelKanbanADMBodyDTO_I,
  UpdateFunnelKanbanADMParamsDTO_I,
} from "./DTO";

export const updateFunnelKanbanADMValidation = (
  req: Request<
    UpdateFunnelKanbanADMParamsDTO_I,
    any,
    UpdateFunnelKanbanADMBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string().optional(),
    businessId: Joi.number().optional(),
    columns: Joi.array().items(
      Joi.object({
        name: Joi.string().optional(),
        id: Joi.number().optional(),
        color: Joi.string().optional(),
        isDelete: Joi.boolean().optional(),
        sequence: Joi.number().optional(),
      })
    ),
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
