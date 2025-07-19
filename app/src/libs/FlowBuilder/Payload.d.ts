import {
  TypeMethodCharge,
  TypePriorityOrder,
  TypeStatusOrder,
} from "@prisma/client";

export type NodeMenuData = {
  interval?: number;
  header?: string;
  items: { value: string; key: string }[];
  footer?: string;
  validateReply?: {
    attempts: number;
    messageErrorAttempts?: { interval?: number; value?: string };
  };
  timeout?: {
    type: ("seconds" | "minutes" | "hours" | "days")[];
    value: number;
  };
};

export type NodeReplyData = (
  | {
      isSave?: boolean;
      list?: number[];
    }
  | { isSave?: false }
) & {
  timeout?: {
    type: ("MINUTES" | "MINUTES" | "HOURS" | "DAYS")[];
    value: number;
  };
};

export type NodeMessageData = {
  messages?: {
    text: string;
    interval?: number;
    key: string;
  }[];
};

export interface NodeAddTagsData {
  list: number[];
}

export interface NodeRemoveTagsData {
  list: number[];
}

export interface NodeAddVariablesData {
  list: { id: number; value: string }[];
}

export interface NodeRemoveVariablesData {
  list: number[];
}

export interface NodeSendFlowData {
  id: string;
}

export interface NodeIfData {
  list?: {
    key: string;
    name: "has-tags" | "no-tags" | "var";
    operatorComparison:
      | "==="
      | "!=="
      | ">="
      | "<="
      | ">"
      | "<"
      | "regex"
      | "[...]";
    operatorLogic: "&&" | "||";
    tagIds: number[];
    value1: string;
    value2: string;
    flags?: string[];
  }[];
}

export type NodeTimerData = {
  value: number;
  type: ["seconds" | "minutes" | "hours" | "days"];
};

export type NodeNotifyWAData = {
  numbers: { key: string; number: string }[];
  text: string;
  tagIds: number[];
};

export type NodeSendFilesData = {
  files: { id: number; originalName: string; mimetype: string | null }[];
  caption?: string;
};

export type NodeSendImagesData = {
  files: { id: number; fileName: string | null }[];
  caption?: string;
};

export type NodeSendVideosData = {
  files: { id: number; originalName: string | null }[];
  caption?: string;
};

export type NodeSendAudiosData = {
  files: { id: number; fileName: string | null; originalName: string }[];
};

export type NodeSendAudiosLiveData = {
  files: { id: number; fileName: string | null; originalName: string }[];
};

export type NodeAgentAIData = {
  prompt?: string;
  agentId: number;
};

export interface NodeTransferDepartmentData {
  id: number;
}

export interface NodeFbPixelData {
  fbPixelId: number;
  viewFieldsUser?: boolean;
  viewFieldsOthers?: boolean;
  event: {
    name: FbConversionEvents;
    userEmail?: string;
    userFirstName?: string;
    userLastName?: string;
    userDobd?: string;
    userDobm?: string;
    userDoby?: string;
    userDateOfBirth?: string;
    userCity?: string;
    userState?: string;
    userCountry?: string;
    userZip?: string;
    userGender?: string;
    customValue?: string;
    customCurrency?: string;
    customStatus?: string;
    customMethod?: string;
    customContentName?: string;
    customContentType?: string;
    customNumItems?: string;
    customContentCategory?: string;
    // customContents?: Content[];
  };
}

export interface NodeListenReactionData {
  varIdToReaction?: number;
  varIdToMessage?: number;
}

export type NodeSwitchVariableData = {
  id: number;
  values: { v: string; key: string }[];
};

export type NodeExtractVariableData = {
  var1Id: number;
  regex: string;
  flags: string[];
  value: string;
  var2Id: number;
  tools?: "match" | "replace";
};

export type NodeChargeData = {
  paymentIntegrationId: number;
  total: number;
  currency?: string;
  businessId?: number; //
  method_type: TypeMethodCharge; //
  varId_email?: number; //
  content?: string; //
  varId_save_transactionId?: number; //
  varId_save_qrCode?: number; //
  varId_save_linkPayment?: number; //
};

export type NodeRandomCodeData = {
  count: number;
  id: number;
};

export type NodeSendTextGroupData = {
  groupName: string;
  messages?: {
    text: string;
    interval?: number;
    key: string;
  }[];
};

export type NodeCreateOrderData = {
  businessId: number; //
  data?: string; //
  total?: string; //
  name?: string; //
  description?: string; //
  status?: TypeStatusOrder; //
  priority?: TypePriorityOrder; //
  origin?: string; //
  delivery_address?: string; //
  charge_transactionId?: string; //
  varId_save_nOrder?: number; //
  notify?: boolean; //
  actionChannels: { key: string; text: string }[];
  delivery_method?: string; // não sei o pq disso já tem o delivery_address
  itens_count?: number;
};

export type NodeUpdateOrderData = {
  nOrder: string;
  data?: string;
  total?: string;
  name?: string;
  description?: string;
  status?: TypeStatusOrder;
  priority?: TypePriorityOrder;
  origin?: string;
  delivery_address?: string;
  tracking_code?: string;
  itens_count?: number;
  charge_transactionId?: string;
  delivery_method?: string;
  actionChannels: { key: string; text: string }[];
  notify?: boolean;
  fields?: string[];
};

export type NodeGetOrdersData = {
  filter: "contact" | "project";
  status?: TypeStatusOrder;
  businessId?: number;
  count?: boolean; // contagem?
  priority?: TypePriorityOrder;
  origin?: string;
  daysAgo?: number; // dias atras contando do dia atual
  varId_save?: number;
  model_save?: string;
  ofContact?: boolean;
};

export type NodeTimedQueueData = {
  value: number;
};

export type NodeCalculatorData = {
  formula: string;
  variableId: number;
};

export type NodeAddTrelloCardData = {
  trelloIntegrationId: number;
  boardId: string;
  listId: string;
  name: string;
  desc?: string;
  // labels: { name: string; color: string }[];
  varId_save_cardId?: number;
};

export type NodeRemoveTrelloCardData = {
  trelloIntegrationId: number;
  varId_cardId?: number;
};

export type NodeMoveTrelloCardData = {
  trelloIntegrationId: number;
  varId_cardId: number;
  boardId: string;
  listId: string;
};

export type NodeUpdateTrelloCardData = {
  trelloIntegrationId: number;
  varId_cardId: number;
  name?: string;
  desc?: string;
  fields?: string[];
  // labels: { name: string; color: string }[];
};

export type NodeWebhookTrelloCardData = {
  varId_cardId?: number;
  varId_save_listBeforeId?: number;
  varId_save_listAfterId?: number;
};

export type TypeNodesPayload =
  | "NodeInitial"
  | "NodeFinish"
  | "NodeMessage"
  | "NodeReply"
  | "NodeMenu"
  | "NodeAddTags"
  | "NodeRemoveTags"
  | "NodeAddVariables"
  | "NodeRemoveVariables"
  | "NodeSendFlow"
  | "NodeIF"
  | "NodeTimer"
  | "NodeNewCardTrello"
  | "NodeSendFiles"
  | "NodeSendImages"
  | "NodeSendVideos"
  | "NodeSendAudios"
  | "NodeSendAudiosLive"
  | "NodeNotifyWA"
  | "NodeAgentAI"
  | "NodeTransferDepartment"
  | "NodeFbPixel"
  | "NodeListenReaction"
  | "NodeSwitchVariable"
  | "NodeExtractVariable"
  | "NodeCharge"
  | "NodeRandomCode"
  | "NodeSendTextGroup"
  | "NodeCreateOrder"
  | "NodeUpdateOrder"
  | "NodeTimedQueue"
  | "NodeCalculator"
  | "NodeAddTrelloCard"
  | "NodeUpdateTrelloCard"
  | "NodeRemoveTrelloCard"
  | "NodeMoveTrelloCard"
  | "NodeWebhookTrelloCard";

export type NodePayload = { id: string } & (
  | { type: "NodeInitial" }
  | { type: "NodeFinish" }
  | { type: "NodeMessage"; data: NodeMessageData }
  | { type: "NodeReply"; data: NodeReplyData }
  | { type: "NodeAddTags"; data: NodeAddTagsData }
  | { type: "NodeRemoveTags"; data: NodeRemoveTagsData }
  | { type: "NodeAddVariables"; data: NodeAddVariablesData }
  | { type: "NodeRemoveVariables"; data: NodeRemoveVariablesData }
  | { type: "NodeSendFlow"; data: NodeSendFlowData }
  | { type: "NodeIF"; data: NodeIfData }
  | { type: "NodeTimer"; data: NodeTimer }
  | { type: "NodeInitial" }
  | { type: "NodeMenu"; data: NodeMenuData }
  | { type: "NodeNotifyWA"; data: NodeNotifyWAData }
  | { type: "NodeSendFiles"; data: NodeSendFilesData }
  | { type: "NodeSendImages"; data: NodeSendImagesData }
  | { type: "NodeSendVideos"; data: NodeSendVideosData }
  | { type: "NodeSendAudios"; data: NodeSendAudiosData }
  | { type: "NodeSendAudiosLive"; data: NodeSendAudiosLiveData }
  | { type: "NodeAgentAI"; data: NodeAgentAIData }
  | { type: "NodeTransferDepartment"; data: NodeTransferDepartmentData }
  | { type: "NodeFbPixel"; data: NodeFbPixelData }
  | { type: "NodeListenReaction"; data: NodeListenReactionData }
  | { type: "NodeSwitchVariable"; data: NodeSwitchVariableData }
  | { type: "NodeExtractVariable"; data: NodeExtractVariableData }
  | { type: "NodeCharge"; data: NodeChargeData }
  | { type: "NodeRandomCode"; data: NodeRandomCodeData }
  | { type: "NodeSendTextGroup"; data: NodeSendTextGroupData }
  | { type: "NodeCreateOrder"; data: NodeCreateOrderData }
  | { type: "NodeUpdateOrder"; data: NodeUpdateOrderData }
  | { type: "NodeTimedQueue"; data: NodeTimedQueueData }
  | { type: "NodeCalculator"; data: NodeCalculatorData }
  | { type: "NodeAddTrelloCard"; data: NodeAddTrelloCardData }
  | { type: "NodeUpdateTrelloCard"; data: NodeUpdateTrelloCardData }
  | { type: "NodeRemoveTrelloCard"; data: NodeRemoveTrelloCardData }
  | { type: "NodeMoveTrelloCard"; data: NodeMoveTrelloCardData }
  | { type: "NodeWebhookTrelloCard"; data: NodeWebhookTrelloCardData }
);
