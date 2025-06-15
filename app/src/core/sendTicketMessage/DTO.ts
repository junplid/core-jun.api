export interface SendTicketMessageParamsDTO_I {
  id: number;
}

export type SendTicketMessageBodyDTO_I =
  | {
      accountId?: number;
      userId?: number;
    } & (
      | { type: "text"; text: string }
      | { type: "audio"; ptt?: boolean; files?: any[] }
      | { type: "image"; caption?: string; files?: any[] }
      | { type: "file"; caption?: string; files?: any[] }
    );

export type SendTicketMessageDTO_I = SendTicketMessageParamsDTO_I &
  SendTicketMessageBodyDTO_I;
