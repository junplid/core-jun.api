import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  ChatbotAlternativeFlows_I,
  ChatbotInactivity_I,
  ChatbotMessageActivationsFail_I,
  ChatbotMessageActivations_I,
  CreateChatbotDTO_I,
} from "./DTO";

export const createChatbotValidation = (
  req: Request<any, any, CreateChatbotDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    subUserUid: Joi.string().optional(),
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    businessId: Joi.number().required(),
    connectionOnBusinessId: Joi.number(),
    typeMessageWhatsApp: Joi.string().regex(/^(textDetermined|anyMessage)$/),
    flowId: Joi.number().required(),
    status: Joi.boolean().optional(),
    description: Joi.string().optional(),
    timesWork: Joi.array()
      .items(
        Joi.object({
          endTime: Joi.string().optional(),
          startTime: Joi.string().optional(),
          dayOfWeek: Joi.number().required(),
        })
      )
      .optional()
      .min(1),
    leadOriginList: Joi.string().optional(),
    insertNewLeadsOnAudienceId: Joi.number().optional(),
    typeActivation: Joi.string()
      .regex(/^(link|message|qrcode)$/)
      .optional(),
    inputActivation: Joi.string().optional(),
    insertTagsLead: Joi.array().items(Joi.number()).optional(),
    ChatbotAlternativeFlows: Joi.object({
      receivingAudioMessages: Joi.number().optional(),
      receivingImageMessages: Joi.number().optional(),
      receivingNonStandardMessages: Joi.number().optional(),
      receivingVideoMessages: Joi.number().optional(),
    } as { [x in keyof ChatbotAlternativeFlows_I]: any }).optional(),
    ChatbotInactivity: Joi.object({
      flowId: Joi.number().required(),
      type: Joi.string()
        .regex(/^(seconds|minutes|hours|days)$/)
        .required(),
      value: Joi.number().required(),
    } as { [x in keyof ChatbotInactivity_I]: any }).optional(),
    ChatbotMessageActivations: Joi.array()
      .items(
        Joi.object({
          text: Joi.array().items(Joi.string()).required(),
          caseSensitive: Joi.boolean(),
          type: Joi.string()
            .regex(/^(contains|startWith|equal|different)$/)
            .required(),
        } as { [x in keyof ChatbotMessageActivations_I]: any })
      )
      .optional(),
    ChatbotMessageActivationsFail: Joi.object({
      audio: Joi.boolean(),
      image: Joi.boolean(),
      text: Joi.boolean(),
    } as { [x in keyof ChatbotMessageActivationsFail_I]: any }).optional(),
  } as { [x in keyof CreateChatbotDTO_I]: any });

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
