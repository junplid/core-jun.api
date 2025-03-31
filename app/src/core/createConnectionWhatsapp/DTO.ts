import { TypeConnetion } from "@prisma/client";

export interface CreateConnectionWhatsappDTO_I {
  name: string;
  accountId: number;
  businessId: number;
  type: TypeConnetion;
  // time_to_start?: Date;
  // time_to_end?: Date;
  // amount_for_start?: number;
  // increment?: number;
  // during?: number;
}
