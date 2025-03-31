export interface UpdateBusinessOnAccountBodyDTO_I {
  accountId: number;
}

export interface UpdateBusinessOnAccountParamsDTO_I {
  id: number;
}

export interface UpdateBusinessOnAccountQueryDTO_I {
  name?: string;
  description?: string;
}

export type UpdateBusinessOnAccountDTO_I = UpdateBusinessOnAccountParamsDTO_I &
  UpdateBusinessOnAccountBodyDTO_I &
  UpdateBusinessOnAccountQueryDTO_I;
