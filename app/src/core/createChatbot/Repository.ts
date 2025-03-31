import {
  TypeActivation,
  TypeChatbotActivations,
  TypeMessageWhatsApp,
} from "@prisma/client";
import {
  ChatbotAlternativeFlows_I,
  ChatbotInactivity_I,
  ChatbotMessageActivationsFail_I,
  ChatbotMessageActivations_I,
} from "./DTO";

export interface PropsCreate {
  accountId: number;
  name: string;
  status?: boolean;
  description?: string;
  leadOriginList?: string;
  flowId: number;
  connectionOnBusinessId?: number;
  insertNewLeadsOnAudienceId?: number;
  typeMessageWhatsApp?: TypeMessageWhatsApp;
  insertTagsLead?: string;
  typeActivation?: TypeActivation;
  inputActivation?: string;
  businessId: number;
  timesWork?: {
    startTime?: string | null;
    endTime?: string | null;
    dayOfWeek: number;
  }[];
  ChatbotInactivity?: ChatbotInactivity_I;
  ChatbotAlternativeFlows?: ChatbotAlternativeFlows_I;
  ChatbotMessageActivationsFail?: ChatbotMessageActivationsFail_I;
}

export interface ResultFetchExistConnection {
  Chatbot: {
    typeActivation: TypeActivation | null;
    inputActivation: string | null;
    typeMessageWhatsApp: TypeMessageWhatsApp | null;
    name: string;
    ChatbotMessageActivations: {
      type: TypeChatbotActivations | null;
      caseSensitive: boolean | null;
      ChatbotMessageActivationValues: {
        value: string;
      }[];
    }[];
    TimesWork: {
      startTime: string | null;
      endTime: string | null;
      dayOfWeek: number;
    }[];
  }[];
}

export interface CreateChatbotRepository_I {
  fetchExist(props: {
    name: string;
    accountId: number;
    businessId: number;
  }): Promise<number>;
  fetchExistConnection(props: {
    accountId: number;
    businessId: number;
    connectionId: number;
  }): Promise<ResultFetchExistConnection | null>;
  create(data: PropsCreate): Promise<{
    readonly createAt: Date;
    readonly id: number;
    businessName: string;
    numberConnection?: string;
  }>;
  createActivations(props: {
    chatbotId: number;
    data: ChatbotMessageActivations_I;
  }): Promise<void>;
}
