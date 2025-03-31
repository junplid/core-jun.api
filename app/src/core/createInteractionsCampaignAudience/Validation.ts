import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateInteractionsCampaignAudienceDTO_I } from "./DTO";

export const createInteractionsCampaignAudienceValidation = (
  req: Request<any, any, CreateInteractionsCampaignAudienceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
    businessIds: Joi.array().items(Joi.number()).required(),
    tagOnBusinessId: Joi.array().items(Joi.number()).optional(),
    sources: Joi.object({
      business: Joi.array().items(Joi.number()).optional(),
      campaigns: Joi.array().items(Joi.number()).optional(),
      audiences: Joi.array().items(Joi.number()).optional(),
    }).optional(),
    filters: Joi.object({
      tagsContacts: Joi.array().items(Joi.number()).optional(),
      variables: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().required(),
            possibleValues: Joi.array().items(Joi.string()).required(),
          })
        )
        .optional(),
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
