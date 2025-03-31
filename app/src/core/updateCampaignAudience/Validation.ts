import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateCampaignAudienceBodyDTO_I,
  UpdateCampaignAudienceParamsDTO_I,
  UpdateCampaignAudienceQueryDTO_I,
} from "./DTO";

export const updateCampaignAudienceValidation = (
  req: Request<
    UpdateCampaignAudienceParamsDTO_I,
    any,
    UpdateCampaignAudienceBodyDTO_I,
    UpdateCampaignAudienceQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()),
    accountId: Joi.number().required(),
    name: Joi.string(),
    tagOnBusinessId: Joi.string()
      .allow("")
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
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
  if (req.query.businessIds?.length) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((s) => Number(s));
  }
  if (req.query.tagOnBusinessId?.length) {
    req.query.tagOnBusinessId = String(req.query.tagOnBusinessId)
      .split("-")
      .map((s) => Number(s));
  }
  if (
    req.query.tagOnBusinessId !== undefined &&
    // @ts-expect-error
    req.query.tagOnBusinessId === ""
  ) {
    req.query.tagOnBusinessId = [];
  }

  console.log(req.query);

  next();
};
