import { TypeStaticPath } from "@prisma/client";

export interface GetStaticFileBodyDTO_I {
  accountId: number;
}

export interface GetStaticFileQueryDTO_I {
  type?: TypeStaticPath;
}

export type GetStaticFileDTO_I = GetStaticFileBodyDTO_I &
  GetStaticFileQueryDTO_I;
