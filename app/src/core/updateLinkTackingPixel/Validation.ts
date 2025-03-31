import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateLinkTackingPixelBodyDTO_I,
  UpdateLinkTackingPixelParamsDTO_I,
  UpdateLinkTackingPixelQueryDTO_I,
} from "./DTO";

export const updateLinkTackingPixelValidation = (
  req: Request<
    UpdateLinkTackingPixelParamsDTO_I,
    any,
    UpdateLinkTackingPixelBodyDTO_I,
    UpdateLinkTackingPixelQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    businessIds: Joi.number(),
    accountId: Joi.number().required(),
    name: Joi.string(),
    link: Joi.string(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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
  if (req.query.businessId) {
    req.query.businessId = Number(req.query.businessId);
  }

  next();
};
