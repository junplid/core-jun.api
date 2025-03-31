import { prisma } from "../../adapters/Prisma/client";
import { DeleteReportLeadHumanServiceController } from "./Controller";
import { DeleteReportLeadHumanServiceImplementation } from "./Implementation";
import { DeleteReportLeadHumanServiceUseCase } from "./UseCase";

const deleteReportLeadHumanServiceImplementation =
  new DeleteReportLeadHumanServiceImplementation(prisma);
const deleteReportLeadHumanServiceUseCase =
  new DeleteReportLeadHumanServiceUseCase(
    deleteReportLeadHumanServiceImplementation
  );

export const deleteReportLeadHumanServiceController =
  DeleteReportLeadHumanServiceController(
    deleteReportLeadHumanServiceUseCase
  ).execute;
