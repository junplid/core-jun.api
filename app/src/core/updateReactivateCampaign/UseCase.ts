import { UpdateReactivateCampaignRepository_I } from "./Repository";
import { UpdateReactivateCampaignDTO_I } from "./DTO";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { clientRedis } from "../../adapters/RedisDB";
import { socketIo } from "../../infra/express";
import moment from "moment-timezone";
import { resolve } from "path";
import { ensureDir, pathExists, writeFile } from "fs-extra";
import { scheduleJob } from "node-schedule";
import { startCampaign } from "../../bin/startCampaign";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateReactivateCampaignUseCase {
  constructor(private repository: UpdateReactivateCampaignRepository_I) {}

  async run(dto: UpdateReactivateCampaignDTO_I) {
    const campaign = await this.repository.fetchCampaign(dto);

    if (!campaign) {
      throw new ErrorResponse(400).toast({
        title: `Campanha não foi encontrada`,
        type: "error",
      });
    }

    const connectionsOnCampaign = campaign.business.map((a) => a.connections);
    const connectionsIds = ([] as number[]).concat(...connectionsOnCampaign);

    const listConnections = await Promise.all(
      connectionsIds.map(async (connectionId) => {
        try {
          const bot = sessionsBaileysWA.get(connectionId);
          return { connectionId, bot };
        } catch (error) {
          return null;
        }
      })
    );

    const listConnectionsValids = listConnections.filter(
      (lc) =>
        lc?.bot && lc.bot.ev.emit("connection.update", { connection: "open" })
    );

    if (!listConnectionsValids.length) {
      throw {
        message: "É preciso que tenha pelo menos uma conexão ativa!",
        statusCode: 400,
      };
    }

    try {
      const pathF = resolve(
        __dirname,
        `../../bin/instructions/account-${dto.accountId}/campaigns`
      );

      const writeFileCamp = async () => {
        await writeFile(
          `${pathF}/camp_${dto.id}.json`,
          JSON.stringify({
            accountId: dto.accountId,
            campaignId: dto.id,
            validConnections: listConnectionsValids.map(
              (s) => s?.connectionId
            ) as number[],
          })
        );
      };

      const createInstruction = async () => {
        (async () => {
          await this.repository.startCampaign({
            campaignId: dto.id,
          });
          const redis = await clientRedis();
          const socketId = await redis.get(`socketid-${dto.accountId}`);
          if (socketId) {
            socketIo.to(socketId).emit("status-campaign", {
              campaignId: dto.id,
              status: "running",
            });
          }
          startCampaign({
            campaignId: dto.id,
            // @ts-expect-error
            clientsWA: listConnectionsValids,
          });
        })();
      };

      scheduleJob(moment().add(20, "seconds").toDate(), () => {
        pathExists(pathF, async (err, exists) => {
          if (err) {
            console.log("deu error, ao verificar se o `path` existe!");
          }

          if (!exists) {
            ensureDir(pathF, async (errx) => {
              if (errx) {
                console.log("Error para criar o path");
              }

              try {
                await writeFileCamp();
                createInstruction();
              } catch (error) {
                console.log("error para escrever", error);
              }
            });
          } else {
            try {
              await writeFileCamp();
              createInstruction();
            } catch (error) {
              console.log("error para escrever", error);
            }
          }
        });
      });
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar re-ativar campanha`,
        type: "error",
      });
    }

    return { message: "OK!", status: 200 };
  }
}
