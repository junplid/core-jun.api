import { GetBusinessIdOnAccountImplementation } from "./Implementation";
import { GetBusinessIdOnAccountController } from "./Controller";
import { GetBusinessIdOnAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getBusinessIdOnAccountImplementation =
  new GetBusinessIdOnAccountImplementation(prisma);
const getBusinessIdOnAccountUseCase = new GetBusinessIdOnAccountUseCase(
  getBusinessIdOnAccountImplementation
);

export const getBusinessIdOnAccountController =
  GetBusinessIdOnAccountController(getBusinessIdOnAccountUseCase).execute;
