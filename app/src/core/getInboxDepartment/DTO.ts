export interface GetInboxDepartmentParamsDTO_I {
  id: number;
}

export interface GetInboxDepartmentBodyDTO_I {
  accountId: number;
}

export type GetInboxDepartmentDTO_I = GetInboxDepartmentBodyDTO_I &
  GetInboxDepartmentParamsDTO_I;
