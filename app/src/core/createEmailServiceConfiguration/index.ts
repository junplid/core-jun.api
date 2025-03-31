import { CraetoEmailServiceConfigurationImplementation } from "./Implementation";
import { CreateEmailServiceConfigurationController } from "./Controller";
import { CreateEmailServiceConfigurationUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createEmailServiceConfigurationImplementation =
  new CraetoEmailServiceConfigurationImplementation(prisma);
const createEmailServiceConfigurationUseCase =
  new CreateEmailServiceConfigurationUseCase(
    createEmailServiceConfigurationImplementation
  );

export const createEmailServiceConfigurationController =
  CreateEmailServiceConfigurationController(
    createEmailServiceConfigurationUseCase
  ).execute;
