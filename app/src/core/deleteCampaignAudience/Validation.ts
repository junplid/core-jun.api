import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteCampaignAudienceBodyDTO_I,
  DeleteCampaignAudienceParamsDTO_I,
} from "./DTO";

export const deleteCampaignAudienceValidation = (
  req: Request<
    DeleteCampaignAudienceParamsDTO_I,
    any,
    DeleteCampaignAudienceBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidationBody = Joi.object({
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
    id: Joi.number().required(),
  });

  const validationBody = schemaValidationBody.validate(
    { ...req.body, ...req.params },
    {
      abortEarly: false,
    }
  );

  if (validationBody.error) {
    const errors = validationBody.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = Number(req.params.id);

  next();
};
