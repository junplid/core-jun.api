import { GetBusinessOnAccountForSelectImplementation } from "./Implementation";
import { GetBusinessOnAccountForSelectController } from "./Controller";
import { GetBusinessOnAccountForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getBusinessOnAccountForSelectImplementation =
  new GetBusinessOnAccountForSelectImplementation(prisma);
const getBusinessOnAccountForSelectUseCase =
  new GetBusinessOnAccountForSelectUseCase(
    getBusinessOnAccountForSelectImplementation
  );

export const getBusinessOnAccountForSelectController =
  GetBusinessOnAccountForSelectController(
    getBusinessOnAccountForSelectUseCase
  ).execute;
