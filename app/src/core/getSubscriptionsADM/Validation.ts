import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetSubscriptionsADMBodyDTO_I,
  GetSubscriptionsADMQueryDTO_I,
} from "./DTO";

export const getSubscriptionsADMValidation = (
  req: Request<
    any,
    any,
    GetSubscriptionsADMBodyDTO_I,
    GetSubscriptionsADMQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    all: Joi.string().valid("0", "1").optional(),
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

  if (req.query.all) req.query.all = !!Number(req.query.all);

  next();
};
