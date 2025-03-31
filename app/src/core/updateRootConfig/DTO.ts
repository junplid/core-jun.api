export type UpdateRootConfigBodyDTO_I = {
  "token-asaas"?: string;
  "endpoint-asaas"?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  authUser?: string;
  authPass?: string;
  email?: string;
  rootId: number;
};

export type UpdateRootConfigDTO_I = UpdateRootConfigBodyDTO_I;
