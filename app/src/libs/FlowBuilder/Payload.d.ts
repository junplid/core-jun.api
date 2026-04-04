import {
  StatusAppointments,
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
    varId?: number;
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
  list?: (
    | {
        key: string;
        name: "has-tags" | "no-tags" | "var" | "appointment";
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
      }
    | {
        key: string;
        name: "appointment";
        operatorComparison: "===" | "!==" | ">=" | "<=" | ">" | "<";
        operatorLogic: "&&" | "||";
        tagIds: number[];
        value1: string;
      }
  )[];
}

export type NodeTimerData = {
  value: number;
  type: ["seconds" | "minutes" | "hours" | "days"];
};

export type NodeNotifyWAData = {
  numbers: { key: string; number: string }[];
  text: string;
  tagIds: number[];
  numbersWithTagIds: number[];
  ignoreTagIds: number[];
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
  exist?: boolean;
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
  businessId?: number;
  method_type: TypeMethodCharge;
  varId_email?: number;
  content?: string;
  varId_save_transactionId?: number;
  varId_save_qrCode?: number;
  varId_save_linkPayment?: number;
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
    varId?: number;
    varId_groupJid?: number;
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
  payment_method?: string; // não sei o pq disso já tem o delivery_address
  itens_count?: number;
  isDragDisabled: boolean;
  sync_order_existing_code?: string;
};

export type NodeAppendRouterData = {
  nOrder: string;
  max?: string;
  minutes?: number;
  varId_save_nRouter?: number;
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
  payment_method?: string;
  actionChannels: { key: string; text: string }[];
  notify?: boolean;
  fields?: string[];
  isDragDisabled?: boolean;
};

export type NodeUpdateRouterData = {
  nRouter: string;
  max?: string;
  nOrder?: string;
  status?: "open" | "awaiting_assignment" | "in_progress" | "finished";
  fields?: ("qnt_max" | "status" | "assign_to_contact" | "add_order")[];
};

export type NodeDeleteOrderData = {
  nOrder: string;
};

export type NodeDeleteRouterOrderData = {
  nOrder: string;
};

export type NodeGetOrderData = {
  nOrder_deliveryCode: string;
  fields?: (
    | "name"
    | "status"
    | "payment_method"
    | "delivery_address"
    | "total"
    | "data"
    | "number_contact"
    | "router_code"
    | "delivery_code"
    | "nOrder"
    | "type_code"
  )[];

  varId_save_name?: number;
  varId_save_status?: number;
  varId_save_payment_method?: number;
  varId_save_delivery_address?: number;
  varId_save_total?: number;
  varId_save_data?: number;
  varId_save_number_contact?: number;

  varId_save_router_code?: number;
  varId_save_delivery_code?: number;
  varId_save_nOrder?: number;
  varId_save_type_code?: number;
};

export type NodeGetRouterData = {
  nRouter: string;
  fields?: (
    | "status"
    | "count_total_orders"
    | "count_order_status_of"
    | "link_router"
    | "link_router_updated"
    | "data_text"
    | "number_contact"
    | "link_join_router"
    | "gain_total"
  )[];

  order_status_of?: string;
  varId_save_status?: number;
  varId_save_count_total_orders?: number;
  varId_save_count_order_status_of?: number;
  varId_save_link_router?: number;
  varId_save_link_router_updated?: number;
  varId_save_data_text?: number;
  varId_save_number_contact?: number;
  varId_save_link_join_router?: number;
  varId_save_gain_total?: number;
};

export type NodeNearestOrderData = {
  geo_string: string; // -99,99999|99,99999
  varId_save_code_order?: number;
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

export type NodeDeleteMessageData = {
  varId_messageId?: number;
  varId_groupJid?: number;
};

export type NodeDistributeData = {
  type: "sequential" | "random" | "balanced" | "intelligent";
  exits: { key: string }[];
};

export type NodeCreateAppointmentData = {
  businessId: number;
  title: string;
  desc?: string;
  status: StatusAppointments;
  startAt: string;
  endAt?:
    | "10min"
    | "30min"
    | "1h"
    | "1h e 30min"
    | "2h"
    | "3h"
    | "4h"
    | "5h"
    | "10h"
    | "15h"
    | "1d"
    | "2d";
  varId_save_nAppointment?: number;
  actionChannels: { key: string; text: string }[];
  reminders?: Date[];
};

export type NodeUpdateAppointmentData = {
  n_appointment: string;
  title?: string;
  desc?: string;
  startAt?: string;
  endAt?:
    | "10min"
    | "30min"
    | "1h"
    | "1h e 30min"
    | "2h"
    | "3h"
    | "4h"
    | "5h"
    | "10h"
    | "15h"
    | "1d"
    | "2d";
  status?: StatusAppointments;
  actionChannels: { key: string; text: string }[];
  notify?: boolean;
  fields?: string[];
  transfer_direction?: boolean;
  reminders?: Date[];
};

export type NodeGetMenuOnlineData = {
  // nMenuOnline: string;
  fields?: (
    | "identifier"
    | "desc"
    | "deviceId_app_agent"
    | "device_online"
    | "titlePage"
    | "link"
    | "address"
    | "lat"
    | "lng"
    | "state_uf"
    | "city"
    | "phone_contact"
    | "whatsapp_contact"
    | "delivery_fee"
    | "city"
  )[];

  varId_save_identifier?: number;
  varId_save_desc?: number;
  varId_save_deviceId_app_agent?: number;
  varId_save_titlePage?: number;
  varId_save_link?: number;
  varId_save_address?: number;
  varId_save_lat?: number;
  varId_save_lng?: number;
  varId_save_state_uf?: number;
  varId_save_city?: number;
  varId_save_phone_contact?: number;
  varId_save_whatsapp_contact?: number;
  varId_save_delivery_fee?: number;
  varId_save_device_online?: number;
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
  | "NodeCreateAppointment"
  | "NodeUpdateAppointment"
  | "NodeTimedQueue"
  | "NodeCalculator"
  | "NodeAddTrelloCard"
  | "NodeUpdateTrelloCard"
  | "NodeRemoveTrelloCard"
  | "NodeMoveTrelloCard"
  | "NodeWebhookTrelloCard"
  | "NodeDeleteMessage"
  | "NodeDeleteOrder"
  | "NodeDeleteRouterOrder"
  | "NodeDistribute"
  | "NodeGetRouter"
  | "NodeUpdateRouter"
  | "NodeAppendRouter"
  | "NodeNearestOrder"
  | "NodeGetMenuOnline";

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
  | { type: "NodeDeleteMessage"; data: NodeDeleteMessageData }
  | { type: "NodeDistribute"; data: NodeDistributeData }
  | { type: "NodeCreateAppointment"; data: NodeCreateAppointmentData }
  | { type: "NodeUpdateAppointment"; data: NodeUpdateAppointmentData }
  | { type: "NodeGetOrder"; data: NodeGetOrderData }
  | { type: "NodeDeleteOrder"; data: NodeDeleteOrderData }
  | { type: "NodeDeleteRouterOrder"; data: NodeDeleteRouterOrderData }
  | { type: "NodeGetRouter"; data: NodeGetRouterData }
  | { type: "NodeUpdateRouter"; data: NodeUpdateRouterData }
  | { type: "NodeAppendRouter"; data: NodeAppendRouterData }
  | { type: "NodeNearestOrder"; data: NodeNearestOrderData }
  | { type: "NodeGetMenuOnline"; data: NodeGetMenuOnlineData }
);
