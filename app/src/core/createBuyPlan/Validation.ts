import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { CreateBuyPlanDTO_I } from "./DTO";

export const createBuyPlanValidation = (
  req: Request<any, any, CreateBuyPlanDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    coupon: Joi.string(),
    accountId: Joi.number().required(),
    planId: Joi.number().required().strict(),
    periodId: Joi.number().required().strict(),
    billingType: Joi.string().valid("CREDIT_CARD", "PIX").required(),
    remoteIp: Joi.string().optional(),
    creditCardId: Joi.number().optional(),
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
