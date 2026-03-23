export interface UpdateMenuOnlineItemParamsDTO_I {
  uuid: string;
  itemUuid: string;
}
export interface UpdateMenuOnlineItemBodyDTO_I {
  accountId: number;
  name?: string;
  desc?: string;
  fileNameImage?: string;
  qnt?: number;
  beforePrice?: number;
  afterPrice?: number;
  categoriesUuid?: string[];
  send_to_category_uuid?: string;
  sections?: {
    uuid: string;
    title?: string;
    helpText?: string;
    required?: boolean;
    minOptions?: number;
    maxOptions?: number;
    subItems: {
      uuid: string;
      image55x55png?: string;
      name: string;
      desc?: string;
      before_additional_price?: number;
      after_additional_price?: number;
      maxLength?: number;
      status: boolean | null;
    }[];
  }[];
}
export type UpdateMenuOnlineItemDTO_I = UpdateMenuOnlineItemParamsDTO_I &
  UpdateMenuOnlineItemBodyDTO_I;
