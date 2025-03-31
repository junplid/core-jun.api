export interface CreateImageConnectionUserParamsDTO_I {
  id: number;
}

export interface CreateImageConnectionUserBodyDTO_I {
  accountId: number;
  fileName: string;
}

export type CreateImageConnectionUserDTO_I =
  CreateImageConnectionUserParamsDTO_I & CreateImageConnectionUserBodyDTO_I;
