import { prisma } from "../../adapters/Prisma/client";
import { GetStatusSessionWhatsappPublicController } from "./Controller";
import { GetStatusSessionWhatsappPublicImplementation } from "./Implementation";
import { GetStatusSessionWhatsappPublicUseCase } from "./UseCase";

const getStatusSessionWhatsappPublicImplementation =
  new GetStatusSessionWhatsappPublicImplementation(prisma);
const getStatusSessionWhatsappPublicUseCase =
  new GetStatusSessionWhatsappPublicUseCase(
    getStatusSessionWhatsappPublicImplementation
  );

export const getStatusSessionWhatsappPublicController =
  GetStatusSessionWhatsappPublicController(
    getStatusSessionWhatsappPublicUseCase
  ).execute;
