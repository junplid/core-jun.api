import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetTicketMessagesBodyDTO_I,
  GetTicketMessagesParamsDTO_I,
  GetTicketMessagesQueryDTO_I,
} from "./DTO";

export const getTicketMessagesValidation = (
  req: Request<
    GetTicketMessagesParamsDTO_I,
    any,
    GetTicketMessagesBodyDTO_I,
    GetTicketMessagesQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    id: Joi.number().required(),
    isRead: Joi.number().default(0).valid(0, 1),
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

  if (req.params.id) req.params.id = Number(req.params.id);
  if (req.query.isRead) req.query.isRead = Number(req.query.isRead);

  next();
};
