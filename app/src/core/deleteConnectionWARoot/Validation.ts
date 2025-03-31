import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteConnectionWARootParamsDTO_I,
  DeleteConnectionWARootBodyDTO_I,
} from "./DTO";

export const deleteConnectionWARootValidation = (
  req: Request<
    DeleteConnectionWARootParamsDTO_I,
    any,
    DeleteConnectionWARootBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    id: Joi.number().required(),
  });
  const validation = schemaValidation.validate(
    { ...req.params, ...req.body },
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
