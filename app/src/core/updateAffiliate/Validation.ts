import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { UpdateAffiliateBodyDTO_I, UpdateAffiliateParamsDTO_I } from "./DTO";

export const updateAffiliateValidation = (
  req: Request<UpdateAffiliateParamsDTO_I, any, UpdateAffiliateBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string(),
    description: Joi.string(),
    status: Joi.boolean(),
    email: Joi.string(),
    walletId: Joi.string(),
    pixKey: Joi.string(),
    number: Joi.string(),
    pixKeyType: Joi.string().valid("CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"),
    commissionType: Joi.string().valid("PERCENTAGE", "REAL"),
    commissionValue: Joi.number(),
    effectiveAfterDays: Joi.number(),
    couponId: Joi.number(),
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

  if (req.body.number) {
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
  }

  req.params.id = Number(req.params.id);

  next();
};
