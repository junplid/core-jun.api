import { NextFunction, Request, Response } from "express";
import { GetTicketsBodyDTO_I, GetTicketsQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getTicketsValidation = (
  req: Request<any, any, GetTicketsBodyDTO_I, GetTicketsQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().optional(),
    userId: Joi.number().optional(),
    page: Joi.number().integer().min(1).default(1),
    status: Joi.string()
      .valid("NEW", "OPEN", "RESOLVED", "DELETED")
      .optional()
      .default("NEW"),
  }).or("accountId", "userId");

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

  const { accountId, userId, ...rest } = validation.value;
  req.query = rest;

  next();
};
