import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateChatbotDTO_I } from "./DTO";

export const createChatbotValidation = (
  req: Request<any, any, CreateChatbotDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    businessId: Joi.number().required(),
    flowId: Joi.string().required(),
    connectionWAId: Joi.number(),
    status: Joi.boolean().optional(),
    description: Joi.string().optional(),
    addLeadToAudiencesIds: Joi.array().items(Joi.number()).optional(),
    addToLeadTagsIds: Joi.array().items(Joi.number()).optional(),
    fallback: Joi.string().optional().allow(""),
    timeToRestart: Joi.object({
      value: Joi.number().required(),
      type: Joi.string()
        .valid("seconds", "minutes", "hours", "days")
        .required(),
    }).optional(),
    operatingDays: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().required(),
        workingTimes: Joi.array().items(
          Joi.object({
            start: Joi.string().optional(),
            end: Joi.string().optional(),
          }).optional()
        ),
      })
    ),
    trigger: Joi.string().allow("").optional(),
    flowBId: Joi.string().allow("").optional(),
    destLink: Joi.string().allow("").optional(),
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
