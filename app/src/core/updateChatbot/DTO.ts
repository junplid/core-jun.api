import {
  TypeActivation,
  TypeChatbotActivations,
  TypeChatbotInactivity,
  TypeMessageWhatsApp,
} from "@prisma/client";

export interface ChatbotInactivity_I {
  type?: TypeChatbotInactivity;
  flowId: number;
  value: number;
}

export interface ChatbotAlternativeFlows_I {
  receivingNonStandardMessages?: number;
  receivingAudioMessages?: number;
  receivingImageMessages?: number;
  receivingVideoMessages?: number;
}

export interface ChatbotMessageActivationsFail_I {
  text?: boolean;
  image?: boolean;
  audio?: boolean;
}

export interface ChatbotMessageActivations_I {
  type?: TypeChatbotActivations;
  text?: string[];
  caseSensitive?: boolean;
}

export interface UpdateChatbotParamsDTO_I {
  id: number;
}

export interface UpdateChatbotBodyDTO_I {
  accountId: number;
  name: string;
  status?: boolean;
  description?: string;
  leadOriginList?: string;
  timesWork?: {
    startTime?: string | null;
    endTime?: string | null;
    dayOfWeek: number;
  }[];
  connectionOnBusinessId?: number;
  insertNewLeadsOnAudienceId?: number;
  insertTagsLead?: number[];
  typeActivation?: TypeActivation;
  flowId?: number;
  typeMessageWhatsApp?: TypeMessageWhatsApp;
  businessId?: number;
  ChatbotInactivity?: ChatbotInactivity_I;
  ChatbotAlternativeFlows?: ChatbotAlternativeFlows_I;
  ChatbotMessageActivationsFail?: ChatbotMessageActivationsFail_I;
  ChatbotMessageActivations?: ChatbotMessageActivations_I[];
}

export type UpdateChatbotDTO_I = UpdateChatbotBodyDTO_I &
  UpdateChatbotParamsDTO_I;
