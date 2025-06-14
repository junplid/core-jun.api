export interface GetInboxDepartmentsQueryDTO_I {}

export interface GetInboxDepartmentsBodyDTO_I {
  accountId: number;
}

export type GetInboxDepartmentsDTO_I = GetInboxDepartmentsBodyDTO_I &
  GetInboxDepartmentsQueryDTO_I;
