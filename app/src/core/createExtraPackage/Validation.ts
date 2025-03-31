import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateExtraPackageDTO_I } from "./DTO";

export const createExtraPackageValidation = (
  req: Request<any, any, CreateExtraPackageDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number(),
    type: Joi.string()
      .valid(
        "business",
        "connections",
        "users",
        "attendants",
        "flows",
        "marketingSends",
        "chatbotConversations",
        "contactsWA",
        "schedulingTool",
        "documentsTool",
        "multiserviceTool",
        "databaseTool"
      )
      .required(),
    name: Joi.string().required(),
    status: Joi.boolean(),
    newSubscribers: Joi.boolean(),
    description: Joi.string(),
    amount: Joi.number().required(),
    textOnPage: Joi.string(),
    periodValidityStart: Joi.date(),
    periodValidityEnd: Joi.date(),
    cycle: Joi.string()
      .valid(
        "WEEKLY",
        "BIWEEKLY",
        "MONTHLY",
        "BIMONTHLY",
        "QUARTERLY",
        "SEMIANNUALLY",
        "YEARLY"
      )
      .required(),
    price: Joi.number().required(),
    planIds: Joi.array().items(Joi.number()),
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
