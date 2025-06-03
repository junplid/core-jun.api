import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetShootingSpeedBodyDTO_I, GetShootingSpeedParamsDTO_I } from "./DTO";

export const getShootingSpeedValidation = (
  req: Request<GetShootingSpeedParamsDTO_I, any, GetShootingSpeedBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    id: Joi.number().required(),
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
