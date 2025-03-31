import { TypeConnetion } from "@prisma/client";

export interface CreateConnectionWhatsappRepository_I {
  create(props: {
    name: string;
    businessId: number;
    type: TypeConnetion;
  }): Promise<{ idConnection: number; createAt: Date; business: string }>;

  fetchExistWithThisName(props: {
    name: string;
    businessId: number;
    type: TypeConnetion;
  }): Promise<number>;
}
