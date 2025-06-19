import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteShootingSpeeBodyDTO_I,
  DeleteShootingSpeeParamsDTO_I,
} from "./DTO";

export const deleteShootingSpeeValidation = (
  req: Request<DeleteShootingSpeeParamsDTO_I, any, DeleteShootingSpeeBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    rootId: Joi.number().required(),
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
