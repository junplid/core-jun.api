import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  ChatbotAlternativeFlows_I,
  ChatbotInactivity_I,
  ChatbotMessageActivationsFail_I,
  ChatbotMessageActivations_I,
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
    subUserUid: Joi.string().optional(),
    accountId: Joi.number().optional(),
    name: Joi.string().optional(),
    businessId: Joi.number().optional(),
    connectionOnBusinessId: Joi.number().optional(),
    typeMessageWhatsApp: Joi.string()
      .regex(/^(textDetermined|anyMessage)$/)
      .optional(),
    flowId: Joi.number().optional(),
    status: Joi.boolean().optional(),
    description: Joi.string().optional().allow(""),
    timesWork: Joi.array()
      .items(
        Joi.object({
          endTime: Joi.string().optional().allow(null),
          startTime: Joi.string().optional().allow(null),
          dayOfWeek: Joi.number(),
        })
      )
      .min(1)
      .optional(),
    leadOriginList: Joi.string().optional().allow(""),
    insertNewLeadsOnAudienceId: Joi.number().optional(),
    typeActivation: Joi.string()
      .regex(/^(link|message|qrcode)$/)
      .optional(),
    insertTagsLead: Joi.array().items(Joi.number()).optional(),
    ChatbotAlternativeFlows: Joi.object({
      receivingAudioMessages: Joi.number().optional(),
      receivingImageMessages: Joi.number().optional(),
      receivingNonStandardMessages: Joi.number().optional(),
      receivingVideoMessages: Joi.number().optional(),
    } as { [x in keyof ChatbotAlternativeFlows_I]: any }).optional(),
    ChatbotInactivity: Joi.object({
      flowId: Joi.number().optional(),
      type: Joi.string()
        .regex(/^(seconds|minutes|hours|days)$/)
        .optional(),
      value: Joi.number().optional(),
    } as { [x in keyof ChatbotInactivity_I]: any }).optional(),
    ChatbotMessageActivations: Joi.array()
      .items(
        Joi.object({
          text: Joi.array().items(Joi.string()).optional(),
          caseSensitive: Joi.boolean().optional(),
          type: Joi.string()
            .regex(/^(contains|startWith|equal|different)$/)
            .optional(),
        } as { [x in keyof ChatbotMessageActivations_I]: any })
      )
      .optional(),
    ChatbotMessageActivationsFail: Joi.object({
      audio: Joi.boolean().optional(),
      image: Joi.boolean().optional(),
      text: Joi.boolean().optional(),
    } as { [x in keyof ChatbotMessageActivationsFail_I]: any }).optional(),
    id: Joi.number(),
  } as { [x in keyof UpdateChatbotDTO_I]: any });

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
