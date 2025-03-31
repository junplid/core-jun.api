import { prisma } from "../../adapters/Prisma/client";
import { CreateReportLeadHumanServiceController } from "./Controller";
import { CreateReportLeadHumanServiceImplementation } from "./Implementation";
import { CreateReportLeadHumanServiceUseCase } from "./UseCase";

const createReportLeadHumanServiceImplementation =
  new CreateReportLeadHumanServiceImplementation(prisma);
const createReportLeadHumanServiceUseCase =
  new CreateReportLeadHumanServiceUseCase(
    createReportLeadHumanServiceImplementation
  );

export const createReportLeadHumanServiceController =
  CreateReportLeadHumanServiceController(
    createReportLeadHumanServiceUseCase
  ).execute;
