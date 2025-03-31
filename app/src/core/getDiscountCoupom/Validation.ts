import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetDiscountCoupomBodyDTO_I,
  GetDiscountCoupomQueryDTO_I,
  GetDiscountCoupomParamsDTO_I,
} from "./DTO";

export const getDiscountCoupomValidation = (
  req: Request<
    GetDiscountCoupomParamsDTO_I,
    any,
    GetDiscountCoupomBodyDTO_I,
    GetDiscountCoupomQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().optional(),
    code: Joi.string().required(),
    planId: Joi.number(),
    extraId: Joi.number(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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

  if (!req.query.extraId && !req.query.planId) {
    return res.status(400).json({
      errors: [
        {
          message: "ID do `Plano` ou `Recurso extra` é obrigatorio",
          path: ["couponCode"],
        },
      ],
    });
  }

  if (req.query.extraId) req.query.extraId = Number(req.query.extraId);
  if (req.query.planId) req.query.planId = Number(req.query.planId);

  next();
};
