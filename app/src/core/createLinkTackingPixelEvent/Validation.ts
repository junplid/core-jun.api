import { NextFunction, Request, Response } from "express";
import { CreateLinkTackingPixelEventDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const createLinkTackingPixelEventValidation = (
  req: Request<any, any, CreateLinkTackingPixelEventDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    linkTrackingPixelId: Joi.number().required(),
    campaignId: Joi.number().optional(),
    contactsWAOnAccountId: Joi.number().required(),
    connectionWhatsId: Joi.number().required(),
    event: Joi.string().required(),
    value: Joi.string().required(),
    flowId: Joi.number().required(),
    flowStateId: Joi.number().required(),
  });

  console.log(req.body);

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
