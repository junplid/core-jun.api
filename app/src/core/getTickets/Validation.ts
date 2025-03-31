import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetTicketsBodyDTO_I, GetTicketsQueryDTO_I } from "./DTO";

export const getTicketsValidation = (
  req: Request<any, any, GetTicketsBodyDTO_I, GetTicketsQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    filter: Joi.string()
      .default("all")
      .valid("all", "unread", "serving", "new", "pending", "resolved"),
    deleted: Joi.string().regex(/^(0|1)$/),
    search: Joi.string(),
    tags: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
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

  if (req.query.deleted) req.query.deleted = !!Number(req.query.deleted);
  if (req.query.tags) {
    req.query.tags = String(req.query.tags)
      .split("-")
      .map((s) => Number(s));
  }

  next();
};
