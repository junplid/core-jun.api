import { prisma } from "../../adapters/Prisma/client";
import { UpdateRootUserController } from "./Controller";
import { CraeteFlowImplementation } from "./Implementation";
import { UpdateRootUserUseCase } from "./UseCase";

const updateRootUserImplementation = new CraeteFlowImplementation(prisma);
const updateRootUserUseCase = new UpdateRootUserUseCase(
  updateRootUserImplementation
);

export const updateRootUserController = UpdateRootUserController(
  updateRootUserUseCase
).execute;
