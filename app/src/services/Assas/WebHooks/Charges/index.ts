import { prisma } from "../../../../adapters/Prisma/client";
import { AsaasWebHookChargesController } from "./Controller";
import { AsaasWebHookChargesImplementation } from "./Implementation";
import { AsaasWebHookChargesUseCase } from "./UseCase";

const asaasWebHookChargesImplementation = new AsaasWebHookChargesImplementation(
  prisma
);
const asaasWebHookChargesUseCase = new AsaasWebHookChargesUseCase(
  asaasWebHookChargesImplementation
);

export const asaasWebHookChargesController = AsaasWebHookChargesController(
  asaasWebHookChargesUseCase
).execute;
