import { NextFunction, Request, Response } from "express";
import {
  GetConnectionsWARootForSelectBodyDTO_I,
  GetConnectionsWARootForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getConnectionsWARootForSelectValidation = (
  req: Request<
    any,
    any,
    GetConnectionsWARootForSelectBodyDTO_I,
    GetConnectionsWARootForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    email: Joi.string(),
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

  next();
};
