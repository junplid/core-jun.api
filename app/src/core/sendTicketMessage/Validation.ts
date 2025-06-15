import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  SendTicketMessageBodyDTO_I,
  SendTicketMessageParamsDTO_I,
} from "./DTO";

export const sendTicketMessageValidation = (
  req: Request<SendTicketMessageParamsDTO_I, any, SendTicketMessageBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const base = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().integer().positive(),
    userId: Joi.number().integer().positive(),
  }).or("accountId", "userId");

  const schemaValidation = Joi.alternatives().try(
    base.keys({
      type: Joi.string().valid("text").required(),
      text: Joi.string().trim().min(1).required(),
      files: Joi.forbidden(),
      ptt: Joi.forbidden(),
      caption: Joi.forbidden(),
    }),

    base.keys({
      type: Joi.string().valid("audio").required(),
      ptt: Joi.boolean().default(false),
      files: Joi.array().items(Joi.any()).min(1).required(),
      text: Joi.forbidden(),
      caption: Joi.forbidden(),
    }),

    base.keys({
      type: Joi.string().valid("image").required(),
      caption: Joi.string().max(2048).allow(""),
      files: Joi.array().items(Joi.any()).min(1).required(),
      text: Joi.forbidden(),
      ptt: Joi.forbidden(),
    }),

    base.keys({
      type: Joi.string().valid("file").required(),
      caption: Joi.string().max(2048).allow(""),
      files: Joi.array().items(Joi.any()).min(1).required(),
      text: Joi.forbidden(),
      ptt: Joi.forbidden(),
    })
  );

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
