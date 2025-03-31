import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateRootCampaignParameterRangesConfigBodyDTO_I,
  UpdateRootCampaignParameterRangesConfigParamsDTO_I,
  UpdateRootCampaignParameterRangesConfigQueryDTO_I,
} from "./DTO";

export const updateRootCampaignParameterRangesConfigValidation = (
  req: Request<
    UpdateRootCampaignParameterRangesConfigParamsDTO_I,
    any,
    UpdateRootCampaignParameterRangesConfigBodyDTO_I,
    UpdateRootCampaignParameterRangesConfigQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string(),
    timeForShorts: Joi.number(),
    timeRest: Joi.number(),
    amountShorts: Joi.number(),
    sequence: Joi.number(),
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

  next();
};
