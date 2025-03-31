import { TypeConnetion } from "@prisma/client";

export interface DeleteConnectionWhatsappRepository_I {
  alreadyExists(props: { id: number; accountId: number }): Promise<{
    name: string;
    type: TypeConnetion;
  } | null>;
  delete(props: { id: number; accountId: number }): Promise<void>;
}
