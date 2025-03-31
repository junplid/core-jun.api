import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateRootCampaignParameterRangesConfigDTO_I } from "./DTO";

export const createRootCampaignParameterRangesConfigValidation = (
  req: Request<any, any, CreateRootCampaignParameterRangesConfigDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    rootId: Joi.number().required(),
    timeForShorts: Joi.number().required(),
    timeRest: Joi.number().required(),
    amountShorts: Joi.number().required(),
    sequence: Joi.number().required(),
    status: Joi.boolean().required(),
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
