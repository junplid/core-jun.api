import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateCouponDTO_I } from "./DTO";

export const createCouponValidation = (
  req: Request<any, any, CreateCouponDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    name: Joi.string().required(),
    description: Joi.string(),
    status: Joi.boolean(),
    activationCode: Joi.string().required(),
    discountType: Joi.string().valid("PERCENTAGE", "REAL").required(),
    discountValue: Joi.number().required(),
    validFrom: Joi.date(),
    validUntil: Joi.date(),
    maxQuantity: Joi.number(),
    isValidOnRenewal: Joi.boolean(),
    applicableTo: Joi.array()
      .items(Joi.string().valid("PLANS", "EXTRAS"))
      .max(2),
    plansIds: Joi.array().items(Joi.number()),
    extrasIds: Joi.array().items(Joi.number()),
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
