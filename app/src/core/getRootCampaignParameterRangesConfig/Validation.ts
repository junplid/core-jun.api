import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetRootCampaignParameterRangesConfigDTO_I } from "./DTO";

export const getRootCampaignParameterRangesConfigValidation = (
  req: Request<any, any, GetRootCampaignParameterRangesConfigDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  next();
};
