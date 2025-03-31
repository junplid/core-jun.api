import { CreateAffiliateDTO_I } from "./DTO";

export type ICreateProps = Omit<CreateAffiliateDTO_I, "number" | "rootId"> & {
  contactWAId: number;
};

export interface CreateAffiliateRepository_I {
  createContactWA(data: {
    completeNumber: string;
  }): Promise<{ readonly contactWAId: number }>;
}
