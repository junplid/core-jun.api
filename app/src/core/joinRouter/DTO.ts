export interface JoinRouterParamsDTO_I {
  code: string;
}

export interface JoinRouterQueryDTO_I {
  fsid: number; // flowStateId;
  nlid: string; // número do contato
}

export interface JoinRouterBodyDTO_I {}

export type JoinRouterDTO_I = JoinRouterBodyDTO_I &
  JoinRouterQueryDTO_I &
  JoinRouterParamsDTO_I;
