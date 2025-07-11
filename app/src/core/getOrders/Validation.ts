import { NextFunction, Request, Response } from "express";
import { GetOrdersBodyDTO_I, GetOrdersQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getOrdersValidation = (
  req: Request<any, any, GetOrdersBodyDTO_I, GetOrdersQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    page: Joi.number().min(1).default(1).optional(),
    limit: Joi.number().min(1).optional(),
    status: Joi.valid(
      "draft",
      "pending",
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
      "failed",
      "on_way"
    ).optional(),
    priority: Joi.valid(
      "low",
      "medium",
      "high",
      "urgent",
      "critical"
    ).optional(),
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

  const { account, ...rest } = validation.value;
  req.query = rest;

  next();
};
