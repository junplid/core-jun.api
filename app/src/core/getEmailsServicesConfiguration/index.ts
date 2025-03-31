import { prisma } from "../../adapters/Prisma/client";
import { GetEmailsServicesConfigurationController } from "./Controller";
import { GetEmailsServicesConfigurationImplementation } from "./Implementation";
import { GetEmailsServicesConfigurationUseCase } from "./UseCase";

const getEmailsServicesConfigurationImplementation =
  new GetEmailsServicesConfigurationImplementation(prisma);
const getEmailsServicesConfigurationUseCase =
  new GetEmailsServicesConfigurationUseCase(
    getEmailsServicesConfigurationImplementation
  );

export const getEmailsServicesConfigurationController =
  GetEmailsServicesConfigurationController(
    getEmailsServicesConfigurationUseCase
  ).execute;
