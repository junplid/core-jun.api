export interface SendTicketMessageParamsDTO_I {
  id: number;
}

export type SendTicketMessageBodyDTO_I = {
  accountId?: number;
  userId?: number;
  sockId_ignore: string;
} & (
  | { type: "text"; text: string; code_uuid: string }
  | {
      type: "audio";
      ptt?: boolean;
      files: {
        id: number;
        type: "audio" | "image/video" | "document";
        code_uuid: string;
      }[];
    }
  | {
      type: "image";
      text?: string;
      files: {
        id: number;
        type: "audio" | "image/video" | "document";
        code_uuid: string;
      }[];
    }
  | {
      type: "file";
      text?: string;
      files: {
        id: number;
        type: "audio" | "image/video" | "document";
        code_uuid: string;
      }[];
    }
);

export type SendTicketMessageDTO_I = SendTicketMessageParamsDTO_I &
  SendTicketMessageBodyDTO_I;
