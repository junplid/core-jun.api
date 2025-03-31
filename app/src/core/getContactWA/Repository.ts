import { ContactsWA } from "@prisma/client";

export interface DeleteContactWARepository_I {
  get(): Promise<ContactsWA[]>;
}
