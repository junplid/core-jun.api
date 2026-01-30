import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateFbPixelBodyDTO_I,
  UpdateFbPixelParamsDTO_I,
  UpdateFbPixelQueryDTO_I,
} from "./DTO";

export const updateFbPixelValidation = (
  req: Request<
    UpdateFbPixelParamsDTO_I,
    any,
    UpdateFbPixelBodyDTO_I,
    UpdateFbPixelQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().optional(),
    pixel_id: Joi.string().optional(),
    access_token: Joi.string().optional(),
    businessId: Joi.number().optional(),
    status: Joi.boolean().optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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
  if (req.query.businessId) {
    req.query.businessId = Number(req.query.businessId);
  }
  req.body.accountId = req.user?.id!;
  next();
};
