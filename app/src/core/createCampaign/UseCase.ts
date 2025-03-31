import { ensureDir, pathExists, writeFile } from "fs-extra";
import moment from "moment-timezone";
import momentOrigins from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { resolve } from "path";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { clientRedis } from "../../adapters/RedisDB";
import { startCampaign } from "../../bin/startCampaign";
import { socketIo } from "../../infra/express";
import { CreateCampaignDTO_I } from "./DTO";
import { CreateCampaignRepository_I } from "./Repository";
import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { TypeStatusCampaign } from "@prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateCampaignUseCase {
  constructor(private repository: CreateCampaignRepository_I) {}

  async run(dto: CreateCampaignDTO_I) {
    const campaignAlreadyExisting =
      await this.repository.fetchExistCampaignWithThisName({
        name: dto.name,
        accountId: dto.accountId,
        businessIds: dto.businessIds,
      });

    if (campaignAlreadyExisting) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe uma campanha com esse nome",
      });
    }
    const isStartNow = !dto.timeToStart;

    if (isStartNow && !dto.connectionOnBusinessIds?.length) {
      throw new ErrorResponse(400).input({
        path: "connectionOnBusinessIds",
        text: "São necessarios conexões para campanhas de inicios imediatos",
      });
    }

    let validConnections: (number | null)[] = [];

    validConnections = await Promise.all(
      dto.connectionOnBusinessIds!.map(async (connectionOnBusinessId) => {
        const isValid = await this.repository.fetchExistConnectionOnBusiness({
          connectionOnBusinessId,
          accountId: dto.accountId,
        });
        return isValid ? connectionOnBusinessId : null;
      })
    );

    if (isStartNow && validConnections.includes(null)) {
      throw new ErrorResponse(400).input({
        path: "connectionOnBusinessIds",
        text: "São necessarios conexões ativas para o inicio imediato",
      });
    }

    if (isStartNow) {
      const listConnections = await Promise.all(
        dto.connectionOnBusinessIds!.map(async (connectionId) => {
          try {
            return (
              sessionsBaileysWA
                .get(connectionId)
                ?.ev.emit("connection.update", { connection: "open" }) || null
            );
          } catch (error) {
            return null;
          }
        })
      );
      if (!listConnections.length || listConnections.includes(null)) {
        throw new ErrorResponse(400).input({
          path: "connectionOnBusinessIds",
          text: "Conexões não encontradas ou estão off-line 1",
        });
      }
    }

    if (validConnections.includes(null)) {
      throw new ErrorResponse(400).input({
        path: "connectionOnBusinessIds",
        text: "Há algumas conexões inválidas",
      });
    }

    const connectionsBeingUsed =
      await this.repository.fetchCampaignOnConnections({
        accountId: dto.accountId,
        connectionOnBusinessIds: dto.connectionOnBusinessIds!,
      });

    if (connectionsBeingUsed) {
      throw new ErrorResponse(400).input({
        path: "connectionOnBusinessIds",
        text: "Algumas conexões já estão sendo usadas",
      });
    }

    const validAudiences = await Promise.all(
      dto.audienceIds.map(async (audienceId) => {
        const isValid = await this.repository.fetchExistAudience({
          accountId: dto.accountId,
          audienceId,
        });
        return !!isValid ? audienceId : null;
      })
    );

    if (validAudiences.includes(null)) {
      throw new ErrorResponse(400).input({
        path: "audienceIds",
        text: "Há alguns públicos inválidos",
      });
    }

    const validParameter = !!(await this.repository.fetchExistParameter({
      accountId: dto.accountId,
      campaignParameterId: dto.campaignParameterId,
    }));

    if (!validParameter) {
      throw new ErrorResponse(400).input({
        path: "campaignParameterId",
        text: "Parâmetro de campanha inválido",
      });
    }

    const flowExist = await this.repository.fetchExistFlow({
      accountId: dto.accountId,
      flowId: dto.flowId,
    });

    if (!flowExist) {
      throw new ErrorResponse(400).input({
        path: "flowId",
        text: "Fluxo não encontrado",
      });
    }

    let denialCampaignId: undefined | number = undefined;

    if (dto.denial) {
      const denialCampaign = await this.repository.createDenial(dto.denial);
      denialCampaignId = denialCampaign.denialCampaignId;
    }

    const { campaignOnBusinessIds, ...campaign } =
      await this.repository.createCampaign({
        description: dto.description,
        flowId: dto.flowId,
        accountId: dto.accountId,
        businessIds: dto.businessIds,
        denialCampaignId,
        isOndemand: false,
        campaignParameterId: dto.campaignParameterId,
        timeToStart: dto.timeToStart,
        audienceIds: dto.audienceIds,
        name: dto.name,
      });

    const contactsWAOnAccountOnAudienceIds =
      await this.repository.fetchAllContactsOfAudience(
        validAudiences as number[]
      );
    const newContactsWAOnAccountOnAudienceIds =
      contactsWAOnAccountOnAudienceIds.flat();

    const newListContactsWAOnAccountOnAudienceIdsUnique =
      newContactsWAOnAccountOnAudienceIds.reduce(
        (
          ac: {
            id: number;
            completeNumber: string;
          }[],
          cur
        ) => {
          if (!ac.length) return [cur];
          const exist = !!ac.find(
            (s) => s.completeNumber === cur.completeNumber
          );
          if (exist) return ac;
          return [...ac, cur];
        },
        []
      );

    (validConnections as number[]).forEach(async (connectionOnBusinessId) => {
      campaignOnBusinessIds.forEach(async (campaignOnBusinessId) => {
        this.repository.createConnectionOnCampaign({
          connectionOnBusinessId,
          campaignOnBusinessId,
        });
        this.repository.createAudienceOnCampaign({
          campaignId: campaign.id,
          contactsWAOnAccountOnAudienceIds:
            newListContactsWAOnAccountOnAudienceIdsUnique.map(({ id }) => id),
        });
      });
    });

    if (isStartNow) {
      const connectionsIds: number[] = dto.connectionOnBusinessIds!;

      const listConnections = await Promise.all(
        connectionsIds.map(async (connectionId) => {
          try {
            return { connectionId, bot: sessionsBaileysWA.get(connectionId) };
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
        throw new ErrorResponse(400).input({
          path: "connectionOnBusinessIds",
          text: "Conexões não encontradas ou estão off-line 2",
        });
      }

      try {
        const pathF = resolve(
          __dirname,
          `../../bin/instructions/account-${dto.accountId}/campaigns`
        );

        const writeFileCamp = async () => {
          await writeFile(
            `${pathF}/camp_${campaign.id}.json`,
            JSON.stringify({
              accountId: dto.accountId,
              campaignId: campaign.id,
              validConnections: validConnections as number[],
            })
          );
        };

        const createInstruction = async () => {
          (async () => {
            await this.repository.startCampaign({
              campaignId: campaign.id,
            });
            const redis = await clientRedis();
            const socketId = await redis.get(`socketid-${dto.accountId}`);
            if (socketId) {
              socketIo.to(socketId).emit("status-campaign", {
                campaignId: campaign.id,
                status: "running",
              });
            }
            startCampaign({
              campaignId: campaign.id,
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
        console.log("Error aqui", error);
      }
    } else {
      const connectionsIds: number[] = dto.connectionOnBusinessIds!;

      const listConnections = await Promise.all(
        connectionsIds.map(async (connectionId) => {
          try {
            return { connectionId, bot: sessionsBaileysWA.get(connectionId) };
          } catch (error) {
            return null;
          }
        })
      );

      // const listConnectionsValids = listConnections.filter((lc) => !!lc?.bot);

      // if (!listConnectionsValids.length) {
      //   throw new ErrorResponse(400).input({
      //     path: "connectionOnBusinessIds",
      //     text: "Conexões não encontradas ou estão off-line",
      //   });
      // }

      try {
        const pathF = resolve(
          __dirname,
          `../../bin/instructions/account-${dto.accountId}/campaigns`
        );

        const writeFileCamp = async () => {
          await writeFile(
            `${pathF}/camp_${campaign.id}.json`,
            JSON.stringify({
              accountId: dto.accountId,
              campaignId: campaign.id,
              validConnections: validConnections as number[],
            })
          );
        };

        const createInstruction = async () => {
          (async () => {
            await this.repository.startCampaign({
              campaignId: campaign.id,
            });
            await prisma.campaign.update({
              where: { id: campaign.id },
              data: { status: "running" },
            });
            const redis = await clientRedis();
            const socketId = await redis.get(`socketid-${dto.accountId}`);
            if (socketId) {
              socketIo.to(socketId).emit("status-campaign", {
                campaignId: campaign.id,
                status: "running",
              });
            }
            startCampaign({
              campaignId: campaign.id,
              // @ts-expect-error
              clientsWA: listConnectionsValids,
            });
          })();
        };

        const nextTime = moment(dto.timeToStart, "YYYY-MM-DDTHH:mm")
          .add(3, "h")
          .toDate();

        scheduleJob(nextTime, () => {
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
        console.log("Error aqui", error);
      }
    }

    return {
      message: "Campanha criada com sucesso!",
      status: 201,
      campaign: {
        ...campaign,
        status: isStartNow ? ("processing" as TypeStatusCampaign) : "stopped",
      },
    };
  }
}
