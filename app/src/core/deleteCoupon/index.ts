import { DeleteCouponImplementation } from "./Implementation";
import { DeleteCouponController } from "./Controller";
import { DeleteCouponUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteCouponImplementation = new DeleteCouponImplementation(prisma);
const deleteCouponUseCase = new DeleteCouponUseCase(deleteCouponImplementation);

export const deleteCouponController =
  DeleteCouponController(deleteCouponUseCase).execute;
