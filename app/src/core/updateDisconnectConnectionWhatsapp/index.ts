import { prisma } from "../../adapters/Prisma/client";
import { UpdateDisconnectConnectionWhatsappController } from "./Controller";
import { UpdateDisconnectConnectionWhatsappImplementation } from "./Implementation";
import { UpdateDisconnectConnectionWhatsappUseCase } from "./UseCase";

const updateDisconnectConnectionWhatsappImplementation =
  new UpdateDisconnectConnectionWhatsappImplementation(prisma);
const updateDisconnectConnectionWhatsappUseCase =
  new UpdateDisconnectConnectionWhatsappUseCase(
    updateDisconnectConnectionWhatsappImplementation
  );

export const updateDisconnectConnectionWhatsappController =
  UpdateDisconnectConnectionWhatsappController(
    updateDisconnectConnectionWhatsappUseCase
  ).execute;
