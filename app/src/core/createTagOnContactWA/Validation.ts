import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateTagOnContactWAQueryDTO_I,
  CreateTagOnContactWABodyDTO_I,
  CreateTagOnContactWAParamsDTO_I,
} from "./DTO";

export const createTagOnContactWAValidation = (
  req: Request<
    CreateTagOnContactWAParamsDTO_I,
    any,
    CreateTagOnContactWABodyDTO_I,
    CreateTagOnContactWAQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number(),
    userId: Joi.number(),
    contactWAId: Joi.number(),
    ticketId: Joi.number(),
  })
    .xor("contactWAId", "ticketId")
    .or("userId", "accountId");

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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

  if (req.query.contactWAId) {
    req.query.contactWAId = Number(req.query.contactWAId);
  }

  if (req.query.ticketId) {
    req.query.ticketId = Number(req.query.ticketId);
  }

  req.params.id = Number(req.params.id);

  next();
};
