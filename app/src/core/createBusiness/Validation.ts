import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateBusinessDTO_I } from "./DTO";

export const createBusinessValidation = (
  req: Request<any, any, CreateBusinessDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
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
  req.body.accountId = req.user?.id!;

  next();
};
