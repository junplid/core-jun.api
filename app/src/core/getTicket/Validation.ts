import { NextFunction, Request, Response } from "express";
import { GetTicketBodyDTO_I, GetTicketParamsDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getTicketValidation = (
  req: Request<GetTicketParamsDTO_I, any, GetTicketBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
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
