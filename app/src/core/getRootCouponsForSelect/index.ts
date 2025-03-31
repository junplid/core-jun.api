import { prisma } from "../../adapters/Prisma/client";
import { GetRootCouponsForSelectController } from "./Controller";
import { GetRootCouponsForSelectImplementation } from "./Implementation";
import { GetRootCouponsForSelectUseCase } from "./UseCase";

const getRootCouponsForSelectImplementation =
  new GetRootCouponsForSelectImplementation(prisma);
const getRootCouponsForSelectUseCase = new GetRootCouponsForSelectUseCase(
  getRootCouponsForSelectImplementation
);

export const getRootCouponsForSelectController =
  GetRootCouponsForSelectController(getRootCouponsForSelectUseCase).execute;
