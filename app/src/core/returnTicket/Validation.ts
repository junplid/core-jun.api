import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { ReturnTicketBodyDTO_I, ReturnTicketParamsDTO_I } from "./DTO";

export const returnTicketValidation = (
  req: Request<ReturnTicketParamsDTO_I, any, ReturnTicketBodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().optional(),
    orderId: Joi.number().optional(),
    id: Joi.number().required(),
  }).or("accountId", "userId");

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  req.params.id = Number(req.params.id);
  req.body.accountId = req.user?.id!;
  next();
};
