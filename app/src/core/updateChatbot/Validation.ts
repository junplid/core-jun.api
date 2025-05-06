import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateChatbotBodyDTO_I,
  UpdateChatbotDTO_I,
  UpdateChatbotParamsDTO_I,
} from "./DTO";

export const updateChatbotValidation = (
  req: Request<UpdateChatbotParamsDTO_I, any, UpdateChatbotBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string().optional(),
    businessId: Joi.number().optional(),
    flowId: Joi.number(),
    connectionWAId: Joi.number(),
    status: Joi.boolean().optional(),
    description: Joi.string().optional(),
    addLeadToAudiencesIds: Joi.array().items(Joi.number()).optional(),
    addToLeadTagsIds: Joi.array().items(Joi.number()).optional(),
    timeToRestart: Joi.object({
      value: Joi.number().optional(),
      type: Joi.string().valid("seconds", "minutes", "hours", "days"),
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
