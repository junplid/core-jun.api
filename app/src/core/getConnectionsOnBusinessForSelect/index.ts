import { GetConnectionsOnBusinessForSelectImplementation } from "./Implementation";
import { GetConnectionsOnBusinessForSelectController } from "./Controller";
import { GetConnectionsOnBusinessForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getConnectionsOnBusinessForSelectImplementation =
  new GetConnectionsOnBusinessForSelectImplementation(prisma);
const getConnectionsOnBusinessForSelectUseCase =
  new GetConnectionsOnBusinessForSelectUseCase(
    getConnectionsOnBusinessForSelectImplementation
  );

export const getConnectionsOnBusinessForSelectController =
  GetConnectionsOnBusinessForSelectController(
    getConnectionsOnBusinessForSelectUseCase
  ).execute;
