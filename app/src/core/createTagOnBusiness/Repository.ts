import { TypeTag } from "@prisma/client";

export interface Props {
  name: string;
  type: TypeTag;
  businessIds: number[];
  accountId: number;
}

export interface CreateTagOnBusinessRepository_I {
  create(data: Props): Promise<{
    readonly tagId: number;
  }>;
  fetchExist(props: Props): Promise<number>;
}
