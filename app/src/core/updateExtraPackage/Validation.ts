import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateExtraPackageBodyDTO_I,
  UpdateExtraPackageParamsDTO_I,
} from "./DTO";

export const updateExtraPackageValidation = (
  req: Request<UpdateExtraPackageParamsDTO_I, any, UpdateExtraPackageBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    type: Joi.string().regex(
      /^(business|connections|users|attendants|flows|marketingSends|chatbotConversations|contactsWA|schedulingTool|documentsTool|multiserviceTool|databaseTool)$/
    ),
    name: Joi.string(),
    status: Joi.boolean(),
    newSubscribers: Joi.boolean(),
    description: Joi.string(),
    amount: Joi.number(),
    textOnPage: Joi.string(),
    periodValidityStart: Joi.date(),
    periodValidityEnd: Joi.date(),
    cycleDays: Joi.number(),
    price: Joi.number(),
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

  next();
};
