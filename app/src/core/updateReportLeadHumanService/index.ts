import { prisma } from "../../adapters/Prisma/client";
import { UpdateReportLeadHumanServiceController } from "./Controller";
import { UpdateReportLeadHumanServiceImplementation } from "./Implementation";
import { UpdateReportLeadHumanServiceUseCase } from "./UseCase";

const updateReportLeadHumanServiceImplementation =
  new UpdateReportLeadHumanServiceImplementation(prisma);
const updateReportLeadHumanServiceUseCase =
  new UpdateReportLeadHumanServiceUseCase(
    updateReportLeadHumanServiceImplementation
  );

export const updateReportLeadHumanServiceController =
  UpdateReportLeadHumanServiceController(
    updateReportLeadHumanServiceUseCase
  ).execute;
