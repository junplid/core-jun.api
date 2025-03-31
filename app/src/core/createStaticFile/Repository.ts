import { TypeStaticPath } from "@prisma/client";

export interface PropsCreate {
  name: string;
  type: TypeStaticPath;
  accountId: number;
  originalName: string;
  size: number;
}

export interface CreateStaticFileRepository_I {
  create(data: PropsCreate): Promise<{
    readonly id: number;
  }>;
}
