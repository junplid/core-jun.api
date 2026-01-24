import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreatePaymentIntegrationDTO_I } from "./DTO";

export const createPaymentIntegrationValidation = (
  req: Request<any, any, CreatePaymentIntegrationDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const baseSchema = {
    accountId: Joi.number().required(),
    name: Joi.string().max(150).required(),
    status: Joi.boolean().optional(),
    provider: Joi.string().valid("mercadopago", "itau").required(),
  };

  const itauSchema = Joi.object({
    ...baseSchema,

    provider: Joi.string().valid("itau").required(),
    clientId: Joi.string().min(5).required(),
    clientSecret: Joi.string().min(10).required(),

    // certificateBuffer: Joi.binary().optional(),
    // certPassword: Joi.string().when("certificateBuffer", {
    //   is: Joi.exist(),
    //   then: Joi.required(),
    //   otherwise: Joi.optional()
    // }),
    pixKey: Joi.string().optional(),
    access_token: Joi.forbidden(),
  });

  const mercadoPagoSchema = Joi.object({
    ...baseSchema,
    provider: Joi.string().valid("mercadopago").required(),
    access_token: Joi.string().min(20).required(),
    clientId: Joi.forbidden(),
    clientSecret: Joi.forbidden(),
    pixKey: Joi.forbidden(),
    // certificateBuffer: Joi.forbidden(),
    // certPassword: Joi.forbidden()
  });

  const schemaValidation = Joi.alternatives().try({
    mercadoPagoSchema,
    itauSchema,
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
