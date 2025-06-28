import { NextFunction, Request, Response } from "express";
import {
  GetPaymentIntegrationsForSelectBodyDTO_I,
  GetPaymentIntegrationsForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getPaymentIntegrationsForSelectValidation = (
  req: Request<
    any,
    any,
    GetPaymentIntegrationsForSelectBodyDTO_I,
    GetPaymentIntegrationsForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    page: Joi.number(),
    name: Joi.string().allow(""),
    provider: Joi.string().valid("mercadopago").allow(""),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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

  if (req.query.page) req.query.page = Number(req.query.page);

  next();
};
