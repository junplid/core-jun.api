import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateCreditCardDTO_I } from "./DTO";

export const createCreditCardValidation = (
  req: Request<any, any, CreateCreditCardDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    remoteIp: Joi.string().optional(),
    useLastHolderInfo: Joi.boolean().optional(),
    creditCardHolderInfo: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      cpfCnpj: Joi.string().required(),
      postalCode: Joi.string().required(),
      addressNumber: Joi.string().required(),
      mobilePhone: Joi.string().required(),
      addressComplement: Joi.string(),
    }).required(),
    creditCard: Joi.object({
      holderName: Joi.string().required(),
      number: Joi.string().required(),
      expiryMonth: Joi.string().required(),
      expiryYear: Joi.string().required(),
      ccv: Joi.string().required(),
    }).required(),
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

  next();
};
