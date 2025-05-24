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

export type NodeSwitchData =
  | {
      type: "tag";
      possibleTags: {
        value: string;
        tagId: number;
        key: string;
      }[];
    }
  | {
      type: "variable";
      variableId: number;
      possibleValues: {
        value: string;
        key: string;
      }[];
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

type TypeValidate =
  | "tel"
  | "number"
  | "cnpj"
  | "cpf"
  | "text"
  | "email"
  | "full_name"
  | "address"
  | "city"
  | "state"
  | "cep"
  | "hour"
  | "weekday"
  | "midia"
  | "value"
  | "regex"
  | "range_numbers";

export interface NodeValidationData {
  variableId: number;
  type: TypeValidate;
  customValidate?: string;
  value?: string;
  flags?: string[];
}

export type NodeMessageData = {
  messages?: {
    text: string;
    interval?: number;
    key: string;
  }[];
};

interface IPaternEvent<T = string> {
  varId: number;
  customValue: T;
}

export type FbConversionEvents =
  | "AddPaymentInfo"
  | "AddToCart"
  | "AddToWishlist"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "InitiateCheckout"
  | "Lead"
  | "Purchase"
  | "Schedule"
  | "Search"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | "ViewContent";
export interface NodeFacebookConversionsData {
  fbIntegrationId: number;
  fbBusinessId: string;
  fbPixelId: string;
  event: {
    name: FbConversionEvents;
    userEmail?: IPaternEvent;
    userFirstName?: IPaternEvent;
    userLastName?: IPaternEvent;
    userDobd?: IPaternEvent;
    userDobm?: IPaternEvent;
    userDoby?: IPaternEvent;
    userDateOfBirth?: IPaternEvent;
    userCity?: IPaternEvent;
    userState?: IPaternEvent;
    userCountry?: IPaternEvent;
    userZip?: IPaternEvent;
    userGender?: IPaternEvent<"m" | "f">;
    customValue?: IPaternEvent<number>;
    customCurrency?: IPaternEvent<"usd" | "brl" | "eur">;
    customStatus?: IPaternEvent<"completed" | "pending" | "canceled">;
    customMethod?: IPaternEvent<"boleto" | "credit_card" | "pix" | "paypal">;
    customContentName?: IPaternEvent;
    customContentType?: IPaternEvent;
    customNumItems?: IPaternEvent<number>;
    customContentCategory?: IPaternEvent;
    customContents?: {
      id?: IPaternEvent;
      quantity?: IPaternEvent<number>;
      itemPrice?: IPaternEvent<number>;
      deliveryCategory?: IPaternEvent<"HOME_DELIVERY" | "IN_STORE">;
      title?: IPaternEvent;
      description?: IPaternEvent;
      brand?: IPaternEvent;
      category?: IPaternEvent;
    }[];
  };
}

export type NodeAttendantAIData = {
  attendantAI: number;
  prompt?: string;
  typingTime?: number;
  objective?: string;
  waitForCompletion?: number;
  roles?: { limitInteractions?: number };
  actions?: {
    type: "variable" | "add-tag" | "del-tag";
    id?: number;
    prompt: string;
    key: string;
  }[];
};

export interface NodeSendContactData {
  fullName: string;
  number: string;
  org: string;
  interval: number;
}

export interface NodeSendVideoData {
  staticFileId: number;
  interval?: number;
  message?: string;
}

export interface NodeSendPdfData {
  staticFileId: number;
  interval?: number;
  message?: string;
}

export interface NodeSendFileData {
  staticFileId: number;
  interval?: number;
  message?: string;
}

export interface NodeSendImageData {
  staticFileId?: number;
  interval?: number;
  message?: string;
  linkImage?: string;
}

export interface NodeSendAudioData {
  staticFileId: number;
  interval?: number;
  message?: string;
}

export interface NodeSendLinkData {
  interval: number;
  link: string;
}

export interface NodeSendLocationGPSData {
  interval: number;
  geolocationId: number;
}

export type NodeMathematicalOperatorsData = {
  aggregation: (
    | {
        type: "mathematics";
        formula: string;
        run?: {
          passToInt?: boolean;
          passToAbsolute?: boolean;
        };
      }
    | {
        type: "date";
        formula: string;
        run?: {
          passToAbsolute?: boolean;
          passToInt?: boolean;
          workingDays?: boolean;
          pick?: "day" | "month" | "year";
          transformDateIntoDay?: boolean;
        };
      }
  )[];
  variableId: number;
};

export type NodeDistributeFlowData = {
  type: "sequential" | "random" | "balanced" | "intelligent";
  exits: {
    key: string;
    percentage?: number;
  }[];
};

export type NodeLogicalConditionData = {
  middlewares: {
    target: string;
    source: string;
    type: "and" | "or";
  }[];
  conditions: ({ key: string } & (
    | {
        type: "has-tag";
        tagOnBusinessId: number;
      }
    | {
        type: "numeric-variable";
        variableId_A: number;
        variableId_B?: number;
        value?: number;
        run:
          | "bigger-than"
          | "less-than"
          | "bigger-or-equal"
          | "less-or-equal"
          | "equal"
          | "not-equal";
      }
    | {
        type: "text-variable";
        run:
          | "contains"
          | "not-contain"
          | "starts-with"
          | "is-empty"
          | "end-with";
        variableOnBusinessId: number;
        value: string; // variavel, texto
      }
    | {
        type: "text-variable";
        run: "it-is" | "its-not";
        precondition?: "cep" | "phone" | "email" | "date";
        variableOnBusinessId: number;
        value?: string; // variavel, regex ou texto
      }
    | {
        type: "system-variable";
        variable: "hour";
        valueOne: string;
        valueTwo: string;
      }
    | {
        type: "system-variable";
        variable: "day-of-week";
        value: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
      }
  ))[];
};

export type NodeCheckPointData = {
  checkPointId: number;
};

export type NodeInterruptionData = {
  items: {
    activators: { value: string; key: string }[];
    key: string;
  }[];
};

export type NodeActionData =
  | { type: "add-tag" | "remove-tag"; tagId: number }
  | { type: "send-flow"; flowId: string }
  | { type: "finish-flow" }
  | { type: "add-to-audience" | "remove-to-audience"; audienceId: number }
  | { type: "variable"; variableId: number; value: string };

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

export type NodeNotifyNumberData = {
  numbers: {
    key: string;
    number: string;
  }[];
  text: string;
};

export type NodeSendHumanServiceData =
  | (
      | {
          destination: "attendant";
          attendantId: number;
          businessId: number;
          sectorId: number;
        }
      | {
          destination: "sector";
          businessId: number;
          sectorId: number;
        }
    ) & {
      columnId: number;
    };

export type NodeEmailSendingData = {
  emailServiceId: number;
  remetent: {
    name: string;
    email: string;
  };
  recipients: {
    key: string;
    email: string;
  }[];
  subject: string;
  text: string;
  html: string;
  staticFileId: number[];
};

export type NodeLinkTackingPixelData = {
  linkTackingPixelId: number;
  text: string;
  interval: number;
};

export type NodeInterruptionLinkTackingPixelData = {
  event: string;
  value: string;
};

export type NodeTimeData =
  | {
      type: "perTime";
      data:
        | {
            option: "delayer";
            value: number;
            type: "seconds" | "minutes" | "hours" | "days";
          }
        | {
            option: "date";
            data:
              | { run: "specificDate"; data: { value: Date } }
              | {
                  run: "dateScheduled";
                  data: {
                    run: "nextDay" | "nextDayWeek";
                    day: number;
                    hourA: string;
                    hourB: string;
                  };
                };
          };
    }
  | {
      type: "perLeadAction";
      data:
        | {
            expected: "text";
            run: "contains" | "starts-with" | "equal";
            activators: {
              v: string;
              k: string;
            }[];
            caseSensitive?: boolean;
            any?: boolean;
          }
        | {
            expected: "text";
            any: true;
          }
        | { expected: "midia" | "link" };
    };

export type NodeTimerData = {
  value: number;
  type: ["seconds" | "minutes" | "hours" | "days"];
};

export type NodeInsertLeaderInAudienceData = {
  audienceId: number;
};

export interface NodeWebhookData {
  method: "get" | "post" | "put" | "delete";
  url: string;
  isHeaders: boolean;
  isBody?: boolean;
  body?: string;
  headers: { key: string; value: string; id: string }[];
  variableId?: number;
}

export type NodeWebformData = {
  method: "get" | "post" | "put" | "delete";
  url: string;
  headers?: string;
};

export type NodeNewCardTrelloData = {
  name: string;
  integrationId: number;
  idList: string;
  desc?: string;
  pos?: "top" | "bottom" | number;
  due?: Date;
  start?: Date | null;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
};

export type TypeNodesPayload =
  | "NodeInitial"
  | "NodeMessage"
  | "NodeReply"
  | "NodeValidation"
  | "NodeMenu"
  | "NodeSwitch"
  | "NodeSendContact"
  | "NodeSendVideo"
  | "NodeSendPdf"
  | "NodeSendFile"
  | "NodeSendImage"
  | "NodeSendAudio"
  | "NodeSendLink"
  | "NodeSendLocationGPS"
  | "NodeMathematicalOperators"
  | "NodeLogicalCondition"
  | "NodeDistributeFlow"
  | "NodeCheckPoint"
  | "NodeInterruption"
  | "NodeAction"
  | "NodeNotifyNumber"
  | "NodeSendHumanService"
  | "NodeEmailSending"
  | "NodeLinkTranckingPixel"
  | "NodeInterruptionLinkTrackingPixel"
  | "NodeTime"
  | "NodeInsertLeaderInAudience"
  | "NodeWebhook"
  | "NodeWebform"
  | "NodeAttendantAI"
  | "NodeAddTags"
  | "NodeRemoveTags"
  | "NodeAddVariables"
  | "NodeRemoveVariables"
  | "NodeSendFlow"
  | "NodeIF"
  | "NodeFacebookConversions"
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
// | { type: "nodeFacebookConversions"; data: NodeFacebookConversionsData }
// | { type: "nodeAttendantAI"; data: NodeAttendantAIData }
// | { type: "nodeValidation"; data: NodeValidationData }
// | { type: "nodeMenu"; data: NodeMenuData }
// | { type: "nodeSwitch"; data: NodeSwitchData }
// | { type: "nodeSendContact"; data: NodeSendContactData }
// | { type: "nodeSendVideo"; data: NodeSendVideoData }
// | { type: "nodeSendPdf"; data: NodeSendPdfData }
// | { type: "nodeSendFile"; data: NodeSendFileData }
// | { type: "nodeSendImage"; data: NodeSendImageData }
// | { type: "nodeSendAudio"; data: NodeSendAudioData }
// | { type: "nodeSendLink"; data: NodeSendLinkData }
// | { type: "nodeSendLocationGPS"; data: NodeSendLocationGPSData }
// | { type: "nodeMathematicalOperators"; data: NodeMathematicalOperatorsData }
// | { type: "nodeLogicalCondition"; data: NodeLogicalConditionData }
// | { type: "nodeDistributeFlow"; data: NodeDistributeFlowData }
// | { type: "nodeCheckPoint"; data: NodeCheckPointData }
// | { type: "nodeInterruption"; data: NodeInterruptionData }
// | { type: "nodeAction"; data: NodeActionData }
// | { type: "nodeNotifyNumber"; data: NodeNotifyNumberData }
// | { type: "nodeSendHumanService"; data: NodeSendHumanServiceData }
// | { type: "nodeEmailSending"; data: NodeEmailSendingData }
// | { type: "nodeLinkTranckingPixel"; data: NodeLinkTackingPixelData }
// | {
//     type: "nodeInterruptionLinkTrackingPixel";
//     data: NodeInterruptionLinkTackingPixelData;
//   }
// | { type: "nodeTime"; data: NodeTimeData }
// | { type: "nodeInsertLeaderInAudience"; data: NodeInsertLeaderInAudienceData }
// | { type: "nodeWebhook"; data: NodeWebhookData }
// | { type: "nodeWebform"; data: NodeWebformData }
// | { type: "nodeNewCardTrello"; data: NodeNewCardTrelloData }
