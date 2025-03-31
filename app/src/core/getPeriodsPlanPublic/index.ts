import { GetPeriodsPlanPublicImplementation } from "./Implementation";
import { GetPeriodsPlanPublicController } from "./Controller";
import { GetPeriodsPlanPublicUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getPeriodsPlanPublicImplementation =
  new GetPeriodsPlanPublicImplementation(prisma);
const getPeriodsPlanPublicUseCase = new GetPeriodsPlanPublicUseCase(
  getPeriodsPlanPublicImplementation
);

export const getPeriodsPlanPublicController = GetPeriodsPlanPublicController(
  getPeriodsPlanPublicUseCase
).execute;
