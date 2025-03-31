export interface DeleteConnectionWhatsappParamsDTO_I {
  id: number;
}

export interface DeleteConnectionWhatsappBodyDTO_I {
  accountId: number;
}

export type DeleteConnectionWhatsappDTO_I = DeleteConnectionWhatsappBodyDTO_I &
  DeleteConnectionWhatsappParamsDTO_I;
