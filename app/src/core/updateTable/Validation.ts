import { NextFunction, Request, Response } from "express";
import { UpdateTableDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const updateTableValidation = (
  req: Request<any, any, UpdateTableDTO_I>,
  _res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    status: Joi.string()
      .valid("AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING")
      .optional(),
    name: Joi.string().optional(),
    id: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
    { abortEarly: false, convert: true },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return _res.status(400).json({ errors });
  }

  req.body.accountId = req.user?.id!;
  next();
};
