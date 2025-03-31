import { UpdateCouponImplementation } from "./Implementation";
import { UpdateCouponController } from "./Controller";
import { UpdateCouponUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const updateCouponImplementation = new UpdateCouponImplementation(prisma);
const updateCouponUseCase = new UpdateCouponUseCase(updateCouponImplementation);

export const updateCouponController =
  UpdateCouponController(updateCouponUseCase).execute;
