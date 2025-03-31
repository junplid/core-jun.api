import { NextFunction, Request, Response } from "express";
import {
  GetCampaignAudienceForSelectBodyDTO_I,
  GetCampaignAudienceForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";
import { TypeAudience } from "@prisma/client";

export const getCampaignAudienceForSelectValidation = (
  req: Request<
    any,
    any,
    GetCampaignAudienceForSelectBodyDTO_I,
    GetCampaignAudienceForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    businessIds: Joi.string().optional(),
    accountId: Joi.number().required(),
    type: Joi.string().regex(
      /^(ondemand|static|interactions)(?:-(ondemand|static|interactions)+)*$/
    ),
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

  if (req.query.type) {
    req.query.type = String(req.query.type).split("-") as TypeAudience[];
  }

  next();
};
