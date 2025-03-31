import { CreateExtraPackageDTO_I } from "./DTO";

export interface CreateExtraPackageRepository_I {
  fetchExist(props: { name: string }): Promise<number>;
  create(data: Omit<CreateExtraPackageDTO_I, "rootId">): Promise<{
    readonly id: number;
    readonly createAt: Date;
    plans: { id: number; name: string }[];
  }>;
}
