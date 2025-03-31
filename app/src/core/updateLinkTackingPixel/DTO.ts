import { TypeTag } from "@prisma/client";

export interface UpdateLinkTackingPixelParamsDTO_I {
  id: number;
}

export interface UpdateLinkTackingPixelQueryDTO_I {
  name?: string;
  type?: TypeTag;
  businessId?: number;
}

export interface UpdateLinkTackingPixelBodyDTO_I {
  accountId: number;
}

export type UpdateLinkTackingPixelDTO_I = UpdateLinkTackingPixelBodyDTO_I &
  UpdateLinkTackingPixelParamsDTO_I &
  UpdateLinkTackingPixelQueryDTO_I;
