import { GetCouponsImplementation } from "./Implementation";
import { GetCouponsController } from "./Controller";
import { GetCouponsUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCouponsImplementation = new GetCouponsImplementation(prisma);
const getCouponsUseCase = new GetCouponsUseCase(getCouponsImplementation);

export const getCouponsController =
  GetCouponsController(getCouponsUseCase).execute;
