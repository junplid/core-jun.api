import { TypeConnetion } from "@prisma/client";

export interface GetConnectionsWARepository_I {
  fetch({ accountId }: { accountId: number }): Promise<
    {
      name: string;
      business: string;
      type: TypeConnetion;
      id: number;
      createAt: Date;
    }[]
  >;
}
