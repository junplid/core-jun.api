import { UpdateAffiliateDTO_I } from "./DTO";

export type IUpdateProps = Omit<UpdateAffiliateDTO_I, "number" | "rootId"> & {
  contactWAId?: number;
  id: number;
};

export interface UpdateAffiliateRepository_I {
  createContactWA(data: {
    completeNumber: string;
  }): Promise<{ readonly contactWAId: number }>;
  update(props: IUpdateProps): Promise<void>;
}
