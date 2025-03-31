import { TypeStaticPath } from "@prisma/client";

export interface CreateStaticFileDTO_I {
  subUserUid?: string;
  type: TypeStaticPath;
  accountId: number;
  name?: string;
  originalName?: string;
  size: number;
}
