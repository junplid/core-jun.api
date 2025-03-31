import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateImportCampaignAudienceDTO_I } from "./DTO";

export const createImportCampaignAudienceValidation = (
  req: Request<any, any, CreateImportCampaignAudienceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    accountId: Joi.number().required(),
    businessId: Joi.array().items(Joi.number()).required(),
    tagOnBusinessId: Joi.array().items(Joi.number()).optional(),
    listContactsWA: Joi.array().items(Joi.number().required()).optional(),
    subUserUid: Joi.string().optional(),
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
