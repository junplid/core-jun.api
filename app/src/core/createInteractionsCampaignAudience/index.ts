import { CreateInteractionsCampaignAudienceImplementation } from "./Implementation";
import { CreateInteractionsCampaignAudienceController } from "./Controller";
import { CreateInteractionsCampaignAudienceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createInteractionsCampaignAudienceImplementation =
  new CreateInteractionsCampaignAudienceImplementation(prisma);
const createInteractionsCampaignAudienceUseCase =
  new CreateInteractionsCampaignAudienceUseCase(
    createInteractionsCampaignAudienceImplementation
  );

export const createInteractionsCampaignAudienceController =
  CreateInteractionsCampaignAudienceController(
    createInteractionsCampaignAudienceUseCase
  ).execute;
