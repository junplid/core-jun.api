import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateIntegrationAiBodyDTO_I,
  UpdateIntegrationAiParamsDTO_I,
  UpdateIntegrationAiQueryDTO_I,
} from "./DTO";
import {
  TypeArtificialIntelligence,
  ModelArtificialIntelligence,
} from "@prisma/client";

export const updateIntegrationAiValidation = (
  req: Request<
    UpdateIntegrationAiParamsDTO_I,
    any,
    UpdateIntegrationAiBodyDTO_I,
    UpdateIntegrationAiQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    businessIds: Joi.string().regex(/^\d+(-\d+)*$/),
    name: Joi.string(),
    description: Joi.string().allow(""),
    temperature: Joi.number().valid(0.0, 1.0, 1.3, 1.5),
    type: Joi.string().valid("OPENAI", "DEEPSEEK"),
    model: Joi.string().valid("DeepseekChat", "DeepseekReasoner"),
    apiKey: Joi.string(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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
  if (req.query.businessIds?.length) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((s) => Number(s));
  }

  next();
};
