import { CreateCouponImplementation } from "./Implementation";
import { CreateCouponController } from "./Controller";
import { CreateCouponUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createCouponImplementation = new CreateCouponImplementation(prisma);
const createCouponUseCase = new CreateCouponUseCase(createCouponImplementation);

export const createCouponController =
  CreateCouponController(createCouponUseCase).execute;
