import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateTrelloIntegrationBodyDTO_I,
  UpdateTrelloIntegrationParamsDTO_I,
} from "./DTO";

export const updateTrelloIntegrationValidation = (
  req: Request<
    UpdateTrelloIntegrationParamsDTO_I,
    any,
    UpdateTrelloIntegrationBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string().optional(),
    token: Joi.string().max(240).optional(),
    key: Joi.string().max(240).optional(),
    status: Joi.boolean().optional(),
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
