import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateChatbotBodyDTO_I,
  UpdateChatbotBodyQueryDTO_I,
  UpdateChatbotDTO_I,
  UpdateChatbotParamsDTO_I,
} from "./DTO";

export const updateChatbotValidation = (
  req: Request<
    UpdateChatbotParamsDTO_I,
    any,
    UpdateChatbotBodyDTO_I,
    UpdateChatbotBodyQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string().optional(),
    businessId: Joi.number().optional(),
    flowId: Joi.string(),
    connectionWAId: Joi.number(),
    status: Joi.boolean().optional(),
    description: Joi.string().optional().allow(""),
    addLeadToAudiencesIds: Joi.array().items(Joi.number()).optional(),
    addToLeadTagsIds: Joi.array().items(Joi.number()).optional(),
    fallback: Joi.string().optional().allow(""),
    timeToRestart: Joi.object({
      value: Joi.number().optional(),
      type: Joi.string().valid("seconds", "minutes", "hours", "days"),
    }).optional(),
    operatingDays: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().required(),
        workingTimes: Joi.array().items(
          Joi.object({
            start: Joi.string().messages({
              "string.empty": `Campo obrigatório.`,
              "string.required": `Campo obrigatório.`,
            }),
            end: Joi.string().messages({
              "string.empty": `Campo obrigatório.`,
              "string.required": `Campo obrigatório.`,
            }),
          }).optional()
        ),
      })
    ),
    trigger: Joi.string().allow("").optional(),
    flowBId: Joi.string().allow("").optional(),
    destLink: Joi.string().allow("").optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
    { abortEarly: false }
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      text: detail.message,
      path: detail.path.join("."),
    }));
    return res.status(400).json({ input: errors });
  }

  const { accountId, id, ...rest } = validation.value as UpdateChatbotDTO_I;

  console.log(rest);

  req.params.id = id;
  req.query = rest;
  req.body.accountId = accountId;

  next();
};
