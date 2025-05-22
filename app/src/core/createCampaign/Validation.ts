import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateCampaignDTO_I } from "./DTO";

export const createCampaignValidation = (
  req: Request<any, any, CreateCampaignDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    subUserUid: Joi.string().optional(),
    name: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    accountId: Joi.number().required(),
    timeToStart: Joi.string().optional(),
    businessIds: Joi.array().items(Joi.number()).required(),
    campaignParameterId: Joi.number().required(),
    audienceIds: Joi.array().items(Joi.number()).required(),
    connectionOnBusinessIds: Joi.array().items(Joi.number()),
    flowId: Joi.string().required(),
    denial: Joi.object({
      receivedMessages: Joi.number().optional(),
      whoHasTag: Joi.string().optional(),
      whoAnsweredConnection: Joi.string().optional(),
      whoIsInFlow: Joi.string().optional(),
      whoIsInCampaign: Joi.string().optional(),
      whoReceivedMessageBefore: Joi.string().optional(),
    }).optional(),
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
