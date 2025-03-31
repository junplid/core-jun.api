import { TypeStaticPath } from "@prisma/client";

export interface PropsGet {
  type?: TypeStaticPath;
  accountId: number;
}

export interface GetStaticFileRepository_I {
  fetch(data: PropsGet): Promise<
    {
      readonly id: number;
      readonly originalName: string;
      readonly name: string;
      readonly type: TypeStaticPath;
      readonly size: number;
    }[]
  >;
}
