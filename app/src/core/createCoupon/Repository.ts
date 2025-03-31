import { CreateCouponDTO_I } from "./DTO";

export type ICreateProps = Omit<CreateCouponDTO_I, "rootId">;

export interface IResult {
  id: number;
  createAt: Date;
  ApplicableCoupons: {
    Plans: { name: string } | null;
    ExtraPackages: { name: string } | null;
  }[];
}

export interface CreateCouponRepository_I {
  create(props: ICreateProps): Promise<IResult>;
}
