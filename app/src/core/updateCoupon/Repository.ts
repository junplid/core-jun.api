import { UpdateCouponDTO_I } from "./DTO";

export type IUpdateProps = Omit<
  UpdateCouponDTO_I,
  "applicableTo" | "rootId"
> & {
  applicableTo?: string;
};

export interface UpdateCouponRepository_I {
  update(props: IUpdateProps): Promise<void>;
}
