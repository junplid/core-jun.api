import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateCampaignOndemandDTO_I } from "./DTO";

export const createCampaignOndemandValidation = (
  req: Request<any, any, CreateCampaignOndemandDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    subUserUid: Joi.string().optional(),
    name: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).required(),
    connectionOnBusinessIds: Joi.array().items(Joi.number()).required(),
    flowId: Joi.number().required(),
    status: Joi.boolean(),
    audienceId: Joi.number().required(),
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
