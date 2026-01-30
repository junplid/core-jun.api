import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteTagOnContactWAQueryDTO_I,
  DeleteTagOnContactWABodyDTO_I,
  DeleteTagOnContactWAParamsDTO_I,
} from "./DTO";

export const deleteTagOnContactWAValidation = (
  req: Request<
    DeleteTagOnContactWAParamsDTO_I,
    any,
    DeleteTagOnContactWABodyDTO_I,
    DeleteTagOnContactWAQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    userId: Joi.number(),
    contactWAId: Joi.number(),
    ticketId: Joi.number(),
  })
    .xor("contactWAId", "ticketId")
    .or("userId", "accountId");

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
    { abortEarly: false },
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
  req.body.accountId = req.user?.id!;

  next();
};
