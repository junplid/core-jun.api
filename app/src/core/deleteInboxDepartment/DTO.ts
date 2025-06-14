export interface DeleteInboxDepartmentParamsDTO_I {
  id: number;
}

export interface DeleteInboxDepartmentBodyDTO_I {
  accountId: number;
}

export type DeleteInboxDepartmentDTO_I = DeleteInboxDepartmentBodyDTO_I &
  DeleteInboxDepartmentParamsDTO_I;
