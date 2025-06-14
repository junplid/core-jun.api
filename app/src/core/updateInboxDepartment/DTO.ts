export interface UpdateInboxDepartmentParamsDTO_I {
  id: number;
}

export interface UpdateInboxDepartmentQueryDTO_I {
  name?: string;
  businessId?: number;
  signBusiness?: boolean;
  signDepartment?: boolean;
  signUser?: boolean;
  previewNumber?: boolean;
  previewPhoto?: boolean;
  inboxUserIds?: number[];
}

export interface UpdateInboxDepartmentBodyDTO_I {
  accountId: number;
}

export type UpdateInboxDepartmentDTO_I = UpdateInboxDepartmentBodyDTO_I &
  UpdateInboxDepartmentParamsDTO_I &
  UpdateInboxDepartmentQueryDTO_I;
