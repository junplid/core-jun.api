import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateContactAccountHumanServiceBodyDTO_I,
  UpdateContactAccountHumanServiceParamsDTO_I,
  UpdateContactAccountHumanServiceQueryDTO_I,
} from "./DTO";

export const updateContactAccountHumanServiceValidation = (
  req: Request<
    UpdateContactAccountHumanServiceParamsDTO_I,
    any,
    UpdateContactAccountHumanServiceBodyDTO_I,
    UpdateContactAccountHumanServiceQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    ticketId: Joi.number().required(),
    userId: Joi.number().required(),
    name: Joi.string().optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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

  req.params.ticketId = Number(req.params.ticketId);

  next();
};
