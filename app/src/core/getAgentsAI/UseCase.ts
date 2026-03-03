import { GetAgentsAIDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { decrypte } from "../../libs/encryption";
import {
  getMetaAccountsIg,
  getMetaMeInfo,
} from "../../services/meta/meta.service";

export class GetAgentsAIUseCase {
  constructor() {}

  async run(dto: GetAgentsAIDTO_I) {
    const data = await prisma.agentAI.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        createAt: true,
        AgentAIOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
        ConnectionIg: {
          select: {
            credentials: true,
            ig_username: true,
            ig_id: true,
            id: true,
          },
        },
        connectionWAId: true,
      },
    });

    const agentsAI = await Promise.all(
      data.map(
        async ({ AgentAIOnBusiness, connectionWAId, ConnectionIg, ...r }) => {
          const connections: {
            id: number;
            type: "ig" | "wa";
            status: "open" | "close";
          }[] = [];
          if (connectionWAId) {
            const isConnected = !!cacheConnectionsWAOnline.get(connectionWAId);
            connections.push({
              id: connectionWAId,
              status: !!isConnected ? "open" : "close",
              type: "wa",
            });
          }
          if (ConnectionIg) {
            try {
              const { account_access_token } = decrypte(
                ConnectionIg.credentials,
              );
              await getMetaMeInfo(account_access_token);
              connections.push({
                id: ConnectionIg.id,
                status: "open",
                type: "ig",
              });
            } catch (error) {
              connections.push({
                id: ConnectionIg.id,
                status: "close",
                type: "ig",
              });
            }
          }

          return {
            ...r,
            connections,
            businesses: AgentAIOnBusiness.map((item) => item.Business),
          };
        },
      ),
    );

    return {
      message: "OK!",
      status: 200,
      agentsAI,
    };
  }
}
