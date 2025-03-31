import { NextFunction, Request, Response } from "express";
import { UpdateCampaignBodyDTO_I, UpdateCampaignParamsDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const updateCampaignValidation = (
  req: Request<UpdateCampaignParamsDTO_I, any, UpdateCampaignBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string(),
    businessIds: Joi.array().items(Joi.number()).optional(),
    audienceIds: Joi.array().items(Joi.number()).optional(),
    connectionOnBusinessIds: Joi.array().items(Joi.number()).optional(),
    flowId: Joi.number(),
    status: Joi.boolean(),
    campaignParameterId: Joi.number(),
    timeToStart: Joi.string().optional(),
    denial: Joi.object({
      receivedMessages: Joi.number().optional(),
      whoHasTag: Joi.string().optional(),
      whoAnsweredConnection: Joi.string().optional(),
      whoIsInFlow: Joi.string().optional(),
      whoIsInCampaign: Joi.string().optional(),
      whoReceivedMessageBefore: Joi.string().optional(),
    }).optional(),
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

  req.params.id = Number(req.params.id);

  next();
};
