export interface CreateMenuOnlineItemParamsDTO_I {
  uuid: string;
}
export interface CreateMenuOnlineItemBodyDTO_I {
  accountId: number;
  name: string;
  desc?: string;
  fileNameImage: string;
  qnt?: number;
  beforePrice?: number;
  afterPrice?: number;
  categoriesUuid?: string[];
  date_validity?: Date;
  send_to_category_uuid?: string;
  sections?: {
    title?: string;
    helpText?: string;
    required?: boolean;
    minOptions?: number;
    maxOptions?: number;
    subItems: {
      image55x55png?: string;
      name: string;
      desc?: string;
      before_additional_price?: number;
      after_additional_price?: number;
      maxLength?: number;
      status: boolean;
    }[];
  }[];
}
export type CreateMenuOnlineItemDTO_I = CreateMenuOnlineItemParamsDTO_I &
  CreateMenuOnlineItemBodyDTO_I;
