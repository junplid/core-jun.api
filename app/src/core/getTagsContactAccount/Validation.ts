import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetTagsContactAccountBodyDTO_I,
  GetTagsContactAccountQueryDTO_I,
} from "./DTO";

export const getTagsContactAccountValidation = (
  req: Request<
    any,
    any,
    GetTagsContactAccountBodyDTO_I,
    GetTagsContactAccountQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    businessId: Joi.number(),
    ticketId: Joi.number(),
    contactAccountId: Joi.number(),
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

  if (req.query.businessId) req.query.businessId = Number(req.query.businessId);
  if (req.query.ticketId) req.query.ticketId = Number(req.query.ticketId);
  if (req.query.contactAccountId)
    req.query.contactAccountId = Number(req.query.contactAccountId);

  next();
};
