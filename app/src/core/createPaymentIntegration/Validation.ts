import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreatePaymentIntegrationDTO_I } from "./DTO";

export const createPaymentIntegrationValidation = (
  req: Request<any, any, CreatePaymentIntegrationDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().max(150).required(),
    provider: Joi.string().valid("mercadopago").default("mercadopago"),
    status: Joi.boolean().optional(),
    access_token: Joi.string().max(240).optional(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.body = validation.value;

  next();
};
