import { readFile } from "fs";
// import { readFileSync } from "fs-extra";
// import { readdir } from "fs/promises";
// import { resolve } from "path";
import {
  Baileys,
  CacheSessionsBaileysWA,
  // sessionsBaileysWA,
} from "../adapters/Baileys";
// import { prisma } from "../adapters/Prisma/client";
// import { startCampaign } from "./startCampaign";
import { socketIo } from "../infra/express";
import { cacheAccountSocket } from "../infra/websocket/cache";

// interface CampaignInstruction {
//   accountId: number;
//   campaignId: number;
//   validConnections: number[];
// }

export const startConnections = (): Promise<void> =>
  new Promise(async (res, rej) => {
    readFile(`${__dirname}/connections.json`, async (err, file) => {
      if (err) return rej(err);
      console.log("--------------------------");
      console.log("INICIANDO CONEXÕES!!");
      console.log("--------------------------");

      const listSessionsConnections: CacheSessionsBaileysWA[] = JSON.parse(
        file.toString()
      );

      if (!listSessionsConnections.length) {
        console.log("NÃO TINHA CONEXÕES PARA SEREM INICIADAS!!");
        return res();
      }

      const clientsWA: CacheSessionsBaileysWA[] = [];

      await new Promise<void>(async (resx) => {
        for await (const session of listSessionsConnections) {
          try {
            const socketIds = cacheAccountSocket.get(
              session.accountId
            )?.listSocket;

            await new Promise<void>(async (ress) => {
              await Baileys({
                ...session,
                maxConnectionAttempts: 1,
                onConnection: (conn) => {
                  if (conn === "open") {
                    socketIds?.forEach((socketId) => {
                      socketIo.to(socketId).emit(`status-connection`, {
                        connectionId: session.connectionWhatsId,
                        connection: "sync",
                      });
                      setTimeout(() => {
                        socketIo.to(socketId).emit(`status-connection`, {
                          connectionId: session.connectionWhatsId,
                          connection: "open",
                        });
                      }, 4500);
                    });
                    clientsWA.push(session);
                    return ress();
                  } else {
                    return ress();
                  }
                },
              });
            });
          } catch (error) {
            console.log("Conexão falhou!");
          }
        }
        resx();
      });

      // if (!clientsWA.length) {
      //   console.log("SESSÕES NÃO ENCONTRADAS!!");
      //   return res();
      // }

      // const findAccountIds = clientsWA.map((c) => c.accountId);
      // const originalAccountId = new Set(findAccountIds);

      // for await (const accountId of originalAccountId) {
      //   try {
      //     const fileData = resolve(
      //       __dirname,
      //       `./instructions/account-${accountId}/campaigns`
      //     );

      //     const campaignsFilesRead: string[] = await readdir(fileData);

      //     for await (const campaignFileName of campaignsFilesRead) {
      //       try {
      //         const campaignId = Number(campaignFileName.replace(/\D/g, ""));
      //         const isRun = await prisma.campaign.count({
      //           where: { id: campaignId, status: "running" },
      //         });

      //         if (isRun) {
      //           const campaignData: CampaignInstruction = JSON.parse(
      //             readFileSync(
      //               `./instructions/account-${accountId}/campaigns/${campaignFileName}`
      //             ).toString()
      //           );

      //           const clientsWACampaign = clientsWA
      //             .filter((c) =>
      //               campaignData.validConnections.includes(c.connectionWhatsId)
      //             )
      //             .map((cc) => ({
      //               connectionId: cc.connectionWhatsId,
      //               bot: sessionsBaileysWA.get(cc.connectionWhatsId),
      //             }));

      //           startCampaign({
      //             campaignId: 1,
      //             clientsWA: clientsWACampaign,
      //           });
      //         }
      //       } catch (error) {
      //         console.log("Não achou a campanha!");
      //       }
      //     }
      //   } catch (error) {
      //     console.log("Não achou as campanha desse account!");
      //   }
      // }
      console.log("--------------------------");
      console.log("CONEXÕES INICIADAS!!");
      console.log("--------------------------");
      return res();
    });
  });
