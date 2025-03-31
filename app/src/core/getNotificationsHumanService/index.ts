import { prisma } from "../../adapters/Prisma/client";
import { GetNotificationsHumanServiceController } from "./Controller";
import { GetNotificationsHumanServiceImplementation } from "./Implementation";
import { GetNotificationsHumanServiceUseCase } from "./UseCase";

const getNotificationsHumanServiceImplementation =
  new GetNotificationsHumanServiceImplementation(prisma);
const getNotificationsHumanServiceUseCase =
  new GetNotificationsHumanServiceUseCase(
    getNotificationsHumanServiceImplementation
  );

export const getNotificationsHumanServiceController =
  GetNotificationsHumanServiceController(
    getNotificationsHumanServiceUseCase
  ).execute;
