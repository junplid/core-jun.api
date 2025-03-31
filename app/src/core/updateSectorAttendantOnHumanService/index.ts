import { prisma } from "../../adapters/Prisma/client";
import { UpdateSectorAttendantOnHumanServiceController } from "./Controller";
import { UpdateSectorAttendantOnHumanServiceImplementation } from "./Implementation";
import { UpdateSectorAttendantOnHumanServiceUseCase } from "./UseCase";

const updateSectorAttendantOnHumanServiceImplementation =
  new UpdateSectorAttendantOnHumanServiceImplementation(prisma);
const updateSectorAttendantOnHumanServiceUseCase =
  new UpdateSectorAttendantOnHumanServiceUseCase(
    updateSectorAttendantOnHumanServiceImplementation
  );

export const updateSectorAttendantOnHumanServiceController =
  UpdateSectorAttendantOnHumanServiceController(
    updateSectorAttendantOnHumanServiceUseCase
  ).execute;
