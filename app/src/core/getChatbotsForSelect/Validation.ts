import { NextFunction, Request, Response } from "express";
import {
  GetChabotsForSelectBodyDTO_I,
  GetChabotsForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getChabotsForSelectValidation = (
  req: Request<
    any,
    any,
    GetChabotsForSelectBodyDTO_I,
    GetChabotsForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    businessIds: Joi.string().optional(),
    accountId: Joi.number().required(),
    status: Joi.string()
      .regex(/^(0|1)$/)
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

  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((e) => Number(e));
  }

  if (req.query.status) {
    req.query.status = !!Number(req.query.status);
  }

  next();
};
