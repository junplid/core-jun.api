import { TypeTag } from "@prisma/client";

export interface CreateTagDTO_I {
  name: string;
  type: TypeTag;
  accountId: number;
  businessIds?: number[];
  targetId?: number;
}
