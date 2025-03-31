import { prisma } from "../../adapters/Prisma/client";
import { GetEmailServiceConfigurationForSelectController } from "./Controller";
import { GetEmailServiceConfigurationForSelectImplementation } from "./Implementation";
import { GetEmailServiceConfigurationForSelectUseCase } from "./UseCase";

const getEmailServiceConfigurationForSelectImplementation =
  new GetEmailServiceConfigurationForSelectImplementation(prisma);
const getEmailServiceConfigurationForSelectUseCase =
  new GetEmailServiceConfigurationForSelectUseCase(
    getEmailServiceConfigurationForSelectImplementation
  );

export const getEmailServiceConfigurationForSelectController =
  GetEmailServiceConfigurationForSelectController(
    getEmailServiceConfigurationForSelectUseCase
  ).execute;
