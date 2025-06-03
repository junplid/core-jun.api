import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetShootingSpeedsDTO_I } from "./DTO";

export const getShootingSpeedsValidation = (
  req: Request<any, any, GetShootingSpeedsDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().optional(),
    accountId: Joi.number().optional(),
  }).xor("rootId", "accountId");

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
