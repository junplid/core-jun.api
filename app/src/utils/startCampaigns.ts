import { prisma } from "../adapters/Prisma/client";
import { resolve } from "path";
import { startCampaign } from "./startCampaign";

const path = resolve(process.env.STORAGE_PATH!, "bin", "connections.json");

export const startCampaigns = async (): Promise<void> => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: { in: ["running", "processing"] } },
      select: { id: true },
    });
    for await (const { id } of campaigns) {
      await startCampaign({ id });
    }
  } catch (error) {
    console.error("Error starting campaigns:", error);
  }
};
