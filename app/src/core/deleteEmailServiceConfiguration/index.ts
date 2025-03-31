import { DeleteEmailServiceConfigurationImplementation } from "./Implementation";
import { DeleteEmailServiceConfigurationController } from "./Controller";
import { DeleteEmailServiceConfigurationUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteEmailServiceConfigurationImplementation =
  new DeleteEmailServiceConfigurationImplementation(prisma);
const deleteEmailServiceConfigurationUseCase =
  new DeleteEmailServiceConfigurationUseCase(
    deleteEmailServiceConfigurationImplementation
  );

export const deleteEmailServiceConfigurationController =
  DeleteEmailServiceConfigurationController(
    deleteEmailServiceConfigurationUseCase
  ).execute;
