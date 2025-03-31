import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateBuyExtraPackageDTO_I } from "./DTO";

export const createBuyExtraPackageValidation = (
  req: Request<any, any, CreateBuyExtraPackageDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    extraPackageId: Joi.number().required(),
    billingType: Joi.string().valid("CREDIT_CARD", "PIX").required(),
    coupon: Joi.string(),
    creditCardId: Joi.number(),
    remoteIp: Joi.string().required(),
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
