import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { PickTicketBodyDTO_I, PickTicketParamsDTO_I } from "./DTO";

export const pickTicketValidation = (
  req: Request<PickTicketParamsDTO_I, any, PickTicketBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().optional(),
    userId: Joi.number().optional(),
    orderId: Joi.number().optional(),
    id: Joi.number().required(),
  }).or("accountId", "userId");

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
