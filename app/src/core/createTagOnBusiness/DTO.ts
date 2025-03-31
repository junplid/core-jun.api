import { TypeTag } from "@prisma/client";

export interface CreateTagOnBusinessDTO_I {
  name: string;
  type: TypeTag;
  accountId: number;
  businessIds: number[];
}
