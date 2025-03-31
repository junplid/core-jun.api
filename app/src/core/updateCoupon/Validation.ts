import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateCouponBodyDTO_I, UpdateCouponParamsDTO_I } from "./DTO";

export const updateCouponValidation = (
  req: Request<UpdateCouponParamsDTO_I, any, UpdateCouponBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string(),
    description: Joi.string(),
    status: Joi.boolean(),
    activationCode: Joi.string(),
    discountType: Joi.string().valid("PERCENTAGE", "REAL"),
    discountValue: Joi.number(),
    validFrom: Joi.date(),
    validUntil: Joi.date(),
    maxQuantity: Joi.number(),
    isValidOnRenewal: Joi.boolean(),
    applicableTo: Joi.array().items(Joi.string().valid("PLANS", "EXTRAS")),
    plansIds: Joi.array().items(Joi.number()),
    extrasIds: Joi.array().items(Joi.number()),
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
