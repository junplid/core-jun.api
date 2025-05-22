import { NextFunction, Request, Response } from "express";
import {
  UpdateCampaignOndemandBodyDTO_I,
  UpdateCampaignOndemandParamsDTO_I,
  UpdateCampaignOndemandQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const updateCampaignOndemandValidation = (
  req: Request<
    UpdateCampaignOndemandParamsDTO_I,
    any,
    UpdateCampaignOndemandBodyDTO_I,
    UpdateCampaignOndemandQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string(),
    description: Joi.string().allow("").optional(),
    businessIds: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
    connectionOnBusinessIds: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
    flowId: Joi.string(),
    status: Joi.boolean(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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
  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((s) => Number(s));
  }
  if (req.query.connectionOnBusinessIds) {
    req.query.connectionOnBusinessIds = String(
      req.query.connectionOnBusinessIds
    )
      .split("-")
      .map((s) => Number(s));
  }
  if (req.query.status) req.query.status = JSON.parse(String(req.query.status));

  next();
};
