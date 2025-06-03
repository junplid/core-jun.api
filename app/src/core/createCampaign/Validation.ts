import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateCampaignDTO_I } from "./DTO";

export const createCampaignValidation = (
  req: Request<any, any, CreateCampaignDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    flowId: Joi.string().required(),
    tagsIds: Joi.array().items(Joi.number()).optional(),
    description: Joi.string().allow("").optional(),
    businessIds: Joi.array().items(Joi.number()).optional(),
    shootingSpeedId: Joi.number().required(),
    connectionIds: Joi.array().items(Joi.number()).optional(),
    timeItWillStart: Joi.string().optional(),
    operatingDays: Joi.array()
      .items(
        Joi.object({
          dayOfWeek: Joi.number().required(),
          workingTimes: Joi.array()
            .items(
              Joi.object({
                start: Joi.string().required(),
                end: Joi.string().required(),
              })
            )
            .optional(),
        })
      )
      .optional(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

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
