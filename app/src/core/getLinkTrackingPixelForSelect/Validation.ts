import { NextFunction, Request, Response } from "express";
import {
  GetLinkTrackingPixelForSelectBodyDTO_I,
  GetLinkTrackingPixelForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getLinkTrackingPixelForSelectValidation = (
  req: Request<
    any,
    any,
    GetLinkTrackingPixelForSelectBodyDTO_I,
    GetLinkTrackingPixelForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    businessIds: Joi.string().optional(),
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

  next();
};
