import { NextFunction, Request, Response } from "express";
import {
  GetFileCampaignAudienceDTO_I,
  GetFileCampaignAudienceParamsDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getFileCampaignAudienceValidation = (
  req: Request<
    GetFileCampaignAudienceParamsDTO_I,
    any,
    GetFileCampaignAudienceDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().not(NaN).required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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
  req.params.id = Number(req.params.id) || req.body.id;

  next();
};
