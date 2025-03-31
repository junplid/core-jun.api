import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateIntegrationAiDTO_I } from "./DTO";

export const createIntegrationAiValidation = (
  req: Request<any, any, CreateIntegrationAiDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    temperature: Joi.number().valid(0.0, 1.0, 1.3, 1.5).optional(),
    type: Joi.string().valid("OPENAI", "DEEPSEEK").required(),
    model: Joi.string()
      .valid(
        "DeepseekChat",
        "DeepseekReasoner",
        "Gpt4",
        "Gpt4Turbo",
        "Gpt4o",
        "Gpt4oMini",
        "O1",
        "O1Mini",
        "Gpt35Turbo0125"
      )
      .required(),
    apiKey: Joi.string().required(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).required(),
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
