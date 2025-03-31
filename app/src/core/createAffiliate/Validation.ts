import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { CreateAffiliateDTO_I } from "./DTO";

export const createAffiliateValidation = (
  req: Request<any, any, CreateAffiliateDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(), //
    email: Joi.string().required(), //
    cpfCnpj: Joi.string().required(), //
    incomeValue: Joi.number().required(), //
    address: Joi.string().required(), //
    addressNumber: Joi.string().required(), //
    province: Joi.string().required(), //
    postalCode: Joi.string().required(), //
    rootId: Joi.number().required(),
    description: Joi.string(),
    status: Joi.boolean().default(true),
    pixKey: Joi.string().required(),
    number: Joi.string().required(),
    birthDate: Joi.string().optional(),
    pixKeyType: Joi.string()
      .valid("CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM")
      .required(),
    commissionType: Joi.string().valid("PERCENTAGE", "REAL").required(),
    commissionValue: Joi.number().required(),
    effectiveAfterDays: Joi.number().default(0),
    couponId: Joi.number(),
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

  const number = validatePhoneNumber(req.body.number, { removeNine: true });

  if (!number) {
    return res.status(400).json({
      errors: [
        {
          message: "Número whatsapp inválido",
          path: ["number"],
        },
      ],
    });
  }

  req.body = { ...req.body, number };

  next();
};
