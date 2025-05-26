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
  | "NodeNewCardTrello";

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
);
