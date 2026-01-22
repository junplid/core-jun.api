import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateAgentAIDTO_I } from "./DTO";

export const createAgentAIValidation = (
  req: Request<any, any, CreateAgentAIDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    providerCredentialId: Joi.number().optional(),
    apiKey: Joi.string().allow("").optional(),
    nameProvider: Joi.string().allow("").optional(),
    businessIds: Joi.array().items(Joi.number()).required(),
    name: Joi.string().required(),
    emojiLevel: Joi.string().valid("none", "low", "medium", "high").optional(),
    language: Joi.string().optional(),
    personality: Joi.string().optional(),
    model: Joi.string().required(),
    temperature: Joi.number().min(0).max(1).optional(),
    knowledgeBase: Joi.string().optional(),
    files: Joi.array().items(Joi.number()).optional(),
    instructions: Joi.string().allow("").optional(),
    timeout: Joi.number().min(1).max(14400).optional(),
    debounce: Joi.number().min(0).max(9).optional(),
    service_tier: Joi.valid(
      "default",
      "flex",
      "auto",
      "scale",
      "priority",
    ).optional(),
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
