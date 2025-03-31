import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CloneCampaignBodyDTO_I, CloneCampaignParamsDTO_I } from "./DTO";

export const cloneCampaignValidation = (
  req: Request<CloneCampaignParamsDTO_I, any, CloneCampaignBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    subUserUid: Joi.string().optional(),
    accountId: Joi.number().required(),
    id: Joi.number().required(),
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
