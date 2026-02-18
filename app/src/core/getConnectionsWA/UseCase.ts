import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { prisma } from "../../adapters/Prisma/client";
import { decrypte } from "../../libs/encryption";
import { getMetaAccountsIg } from "../../services/meta/meta.service";
import { GetConnectionsWADTO_I } from "./DTO";

export class GetConnectionsWAUseCase {
  constructor() {}

  async run(dto: GetConnectionsWADTO_I) {
    const connections = await prisma.connectionWA.findMany({
      where: { Business: dto },
      orderBy: { id: "desc" },
      select: {
        name: true,
        id: true,
        Business: { select: { name: true, id: true } },
        createAt: true,
        AgentAI: { select: { id: true, name: true } },
      },
    });

    const connectionsig = await prisma.connectionIg.findMany({
      where: { Business: dto },
      orderBy: { id: "desc" },
      select: {
        ig_username: true,
        id: true,
        Business: { select: { name: true, id: true } },
        AgentAI: { select: { id: true, name: true } },
        createAt: true,
        credentials: true,
      },
    });

    const nextConnectionsig = await Promise.all(
      connectionsig.map(async ({ ig_username, credentials, ...ig }) => {
        try {
          // const { account_access_token } = decrypte(credentials);
          // await getMetaAccountsIg(account_access_token);
          return { ...ig, name: `@${ig_username}`, status: "open", type: "ig" };
        } catch (error) {
          return {
            ...ig,
            name: `@${ig_username}`,
            status: "close",
            type: "ig",
          };
        }
      }),
    );
    const nextConnections = await Promise.all(
      connections.map(async (cnn) => {
        try {
          const isConnected = !!cacheConnectionsWAOnline.get(cnn.id);
          return {
            ...cnn,
            status: !!isConnected ? "open" : "close",
            type: "msg",
          };
        } catch (error) {
          return { ...cnn, status: "close", type: "msg" };
        }
      }),
    );

    return {
      message: "OK!",
      status: 200,
      connectionsWA: [...nextConnectionsig, ...nextConnections],
    };
  }
}
