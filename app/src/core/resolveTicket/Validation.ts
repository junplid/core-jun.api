import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { ResolveTicketBodyDTO_I, ResolveTicketParamsDTO_I } from "./DTO";

export const resolveTicketValidation = (
  req: Request<ResolveTicketParamsDTO_I, any, ResolveTicketBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().optional(),
    userId: Joi.number().optional(),
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
