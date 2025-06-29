import { TypeMethodCharge } from "@prisma/client";

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
};

export type NodeChargeData = {
  paymentIntegrationId: number;
  total: number;
  currency?: string;
  businessId: number; //
  method_type: TypeMethodCharge; //
  varId_email?: number; //
  content?: string; //
  varId_save_transactionId?: number; //
  varId_save_qrCode?: number; //
  varId_save_linkPayment?: number; //
};

export type TypeNodesPayload =
  | "NodeInitial"
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
  | "NodeCharge";

export type NodePayload = { id: string } & (
  | { type: "NodeInitial" }
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
);
