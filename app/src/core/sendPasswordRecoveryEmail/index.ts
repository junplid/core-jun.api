import { prisma } from "../../adapters/Prisma/client";
import { SendPasswordRecoveryEmailController } from "./Controller";
import { SendPasswordRecoveryEmailImplementation } from "./Implementation";
import { SendPasswordRecoveryEmailUseCase } from "./UseCase";

const sendPasswordRecoveryEmailImplementation =
  new SendPasswordRecoveryEmailImplementation(prisma);
const sendPasswordRecoveryEmailUseCase = new SendPasswordRecoveryEmailUseCase(
  sendPasswordRecoveryEmailImplementation
);

export const sendPasswordRecoveryEmailController =
  SendPasswordRecoveryEmailController(sendPasswordRecoveryEmailUseCase).execute;
