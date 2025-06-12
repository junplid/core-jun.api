import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { TestAgentAIDTO_I } from "./DTO";

export const testAgentAIValidation = (
  req: Request<any, any, TestAgentAIDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    content: Joi.string().required(),
    providerCredentialId: Joi.number().optional(),
    apiKey: Joi.string().allow("").optional(),
    accountId: Joi.number().required(),
    tokenTest: Joi.string().required(),
    name: Joi.string().required(),
    emojiLevel: Joi.string().valid("none", "low", "medium", "high").optional(),
    personality: Joi.string().optional(),
    model: Joi.string().required(),
    language: Joi.string().optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    knowledgeBase: Joi.string().optional(),
    files: Joi.array().items(Joi.number()).optional(),
    instructions: Joi.string().allow("").optional(),
  }).or("providerCredentialId", "apiKey");

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
