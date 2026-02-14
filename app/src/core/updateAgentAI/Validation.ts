import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateAgentAIBodyDTO_I, UpdateAgentAIParamsDTO_I } from "./DTO";

export const updateAgentAIValidation = (
  req: Request<UpdateAgentAIParamsDTO_I, any, UpdateAgentAIBodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    providerCredentialId: Joi.number().optional(),
    apiKey: Joi.string().allow("").optional(),
    nameProvider: Joi.string().allow("").optional(),
    businessIds: Joi.array().items(Joi.number()).optional(),
    name: Joi.string().optional(),
    emojiLevel: Joi.string().valid("none", "low", "medium", "high").optional(),
    language: Joi.string().optional(),
    personality: Joi.string().allow("").optional(),
    model: Joi.string().optional(),
    modelTranscription: Joi.string().optional().allow(null),
    temperature: Joi.number().min(0).max(1).optional(),
    knowledgeBase: Joi.string().allow("").optional(),
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

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
    { abortEarly: false },
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
  req.body.accountId = req.user?.id!;
  next();
};
