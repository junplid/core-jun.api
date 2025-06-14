export interface CreateInboxDepartmentDTO_I {
  accountId: number;
  name: string;
  businessId: number;
  signBusiness?: boolean;
  signDepartment?: boolean;
  signUser?: boolean;
  previewNumber?: boolean;
  previewPhoto?: boolean;
  inboxUserIds: number[];
}
