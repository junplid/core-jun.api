import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateContactCampaignAudienceDTO_I } from "./DTO";

export const createContactCampaignAudienceValidation = (
  req: Request<any, any, CreateContactCampaignAudienceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    listContactsWA: Joi.array().items(Joi.number().required()).optional(),
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
