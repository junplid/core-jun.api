export interface UpdateInboxUserParamsDTO_I {
  id: number;
}

export interface UpdateInboxUserQueryDTO_I {
  name?: string;
  email?: string;
  password?: string;
  inboxDepartmentId?: number;
}

export interface UpdateInboxUserBodyDTO_I {
  accountId: number;
}

export type UpdateInboxUserDTO_I = UpdateInboxUserBodyDTO_I &
  UpdateInboxUserParamsDTO_I &
  UpdateInboxUserQueryDTO_I;
