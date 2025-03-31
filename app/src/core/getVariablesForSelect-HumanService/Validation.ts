import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetVariablesForSelectHumanServiceBodyDTO_I,
  GetVariablesForSelectHumanServiceQueryDTO_I,
} from "./DTO";

export const getVariablesForSelectHumanServiceValidation = (
  req: Request<
    any,
    any,
    GetVariablesForSelectHumanServiceBodyDTO_I,
    GetVariablesForSelectHumanServiceQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    name: Joi.string().allow(""),
    ticketId: Joi.number(),
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

  if (req.query.ticketId) req.query.ticketId = Number(req.query.ticketId);

  next();
};
