import { TypeConnetion } from "@prisma/client";

export interface UpdateConnectionWARepository_I {
  update(
    where: { id: number; accountId: number },
    data: {
      name?: string;
      type?: TypeConnetion;
      businessId?: number;
    }
  ): Promise<{ business: string }>;
  fetchExist(props: { id: number; accountId: number }): Promise<number>;
}
