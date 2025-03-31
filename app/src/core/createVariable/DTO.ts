export interface CreateVariableDTO_I {
  name: string;
  businessIds: number[];
  accountId: number;
  type: "dynamics" | "constant";
  targetId?: number;
  value?: string;
}
