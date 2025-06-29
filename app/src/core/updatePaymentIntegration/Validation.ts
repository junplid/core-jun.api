import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdatePaymentIntegrationBodyDTO_I,
  UpdatePaymentIntegrationParamsDTO_I,
} from "./DTO";

export const updatePaymentIntegrationValidation = (
  req: Request<
    UpdatePaymentIntegrationParamsDTO_I,
    any,
    UpdatePaymentIntegrationBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string().optional(),
    access_token: Joi.string().optional(),
    status: Joi.boolean().optional(),
    provider: Joi.string()
      .valid("mercadopago")
      .optional()
      .default("mercadopago"),
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
