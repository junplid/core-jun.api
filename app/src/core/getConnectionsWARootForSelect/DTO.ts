export interface GetConnectionsWARootForSelectBodyDTO_I {
  rootId: number;
}

export interface GetConnectionsWARootForSelectQueryDTO_I {
  email?: string;
}

export type GetConnectionsWARootForSelectDTO_I =
  GetConnectionsWARootForSelectBodyDTO_I &
    GetConnectionsWARootForSelectQueryDTO_I;
