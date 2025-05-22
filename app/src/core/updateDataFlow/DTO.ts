export interface UpdateDataFlowParamsDTO_I {
  id: string;
}

export interface UpdateDataFlowBodyDTO_I {
  accountId: number;
  nodes?: {
    type: "upset" | "delete";
    node: { id: string; [x: string]: any };
  }[];
  edges?: {
    type: "upset" | "delete";
    edge: { id: string; [x: string]: any };
  }[];
}

export type UpdateDataFlowDTO_I = UpdateDataFlowBodyDTO_I &
  UpdateDataFlowParamsDTO_I;
