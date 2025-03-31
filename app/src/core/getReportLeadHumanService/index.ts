import { prisma } from "../../adapters/Prisma/client";
import { GetReportLeadHumanServiceController } from "./Controller";
import { GetReportLeadHumanServiceImplementation } from "./Implementation";
import { GetReportLeadHumanServiceUseCase } from "./UseCase";

const getReportLeadHumanServiceImplementation =
  new GetReportLeadHumanServiceImplementation(prisma);
const getReportLeadHumanServiceUseCase = new GetReportLeadHumanServiceUseCase(
  getReportLeadHumanServiceImplementation
);

export const getReportLeadHumanServiceController =
  GetReportLeadHumanServiceController(getReportLeadHumanServiceUseCase).execute;
