export interface RunActionChannelOrderParamsDTO_I {
  id: number;
  action: string;
}

export interface RunActionChannelOrderBodyDTO_I {
  accountId: number;
}

export type RunActionChannelOrderDTO_I = RunActionChannelOrderBodyDTO_I &
  RunActionChannelOrderParamsDTO_I;
