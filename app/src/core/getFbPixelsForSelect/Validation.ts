import { NextFunction, Request, Response } from "express";
import {
  GetFbPixelsForSelectBodyDTO_I,
  GetFbPixelsForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getFbPixelsForSelectValidation = (
  req: Request<
    any,
    any,
    GetFbPixelsForSelectBodyDTO_I,
    GetFbPixelsForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    businessId: Joi.array().items(Joi.number()).optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
    { abortEarly: false },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.query.businessId = validation.value.businessId || [];
  req.body.accountId = req.user?.id!;

  next();
};
