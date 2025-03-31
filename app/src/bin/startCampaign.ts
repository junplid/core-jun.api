import { WASocket } from "baileys";
import Holidays, { HolidaysTypes } from "date-holidays";
import { chunk } from "underscore";
import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { prisma } from "../adapters/Prisma/client";
import { clientRedis } from "../adapters/RedisDB";
import { ModelFlows } from "../adapters/mongo/models/flows";
import { getContactWAOfCampaign } from "../globalImplementation/Campaign.globalImplementation";
import { socketIo } from "../infra/express";
import { NodeControler } from "../libs/Nodes/Control";

let holidaysList: HolidaysTypes.Holiday[] = [];

// schedule("2 0 * * *", () => {
//   const hd = new Holidays("BR", { timezone: "America/Sao_Paulo" });
//   holidaysList = hd.getHolidays(moment().tz("America/Sao_Paulo").get("year"));
// });

(() => {
  const hd = new Holidays("BR", { timezone: "America/Sao_Paulo" });
  holidaysList = hd.getHolidays(moment().tz("America/Sao_Paulo").get("year"));
})();

interface PropsStartCampaign {
  campaignId: number;
  clientsWA: { connectionId: number; bot?: WASocket }[];
}

function getTimeBR(time: string) {
  return moment()
    .tz("America/Sao_Paulo")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

export const startCampaign = async (
  props: PropsStartCampaign
): Promise<void> => {
  return new Promise(async (res, rej) => {
    await new Promise<void>(async (resP, rejP) => {
      async function verify() {
        const campaign = await prisma.campaign.findFirst({
          where: { id: props.campaignId },
          select: {
            interrupted: true,
            CampaignOnBusiness: {
              select: {
                ConnectionOnCampaign: {
                  select: {
                    ConnectionOnBusiness: { select: { interrupted: true } },
                  },
                },
                Business: { select: { interrupted: true } },
              },
            },
          },
        });

        if (!campaign) return rejP();

        const allBusinessInterruped = campaign.CampaignOnBusiness.map(
          (s) => s.Business.interrupted
        ).every((s) => s);

        if (allBusinessInterruped) {
          setTimeout(() => verify, 1000 * 60 * 3);
          return;
        }

        if (campaign.interrupted) {
          setTimeout(() => verify, 1000 * 60 * 3);
          return;
        }

        const allConnectionsInterruped = campaign.CampaignOnBusiness.map((s) =>
          s.ConnectionOnCampaign.map((v) => v.ConnectionOnBusiness.interrupted)
        )
          .flat()
          .every((s) => s);

        if (allConnectionsInterruped) {
          setTimeout(() => verify, 1000 * 60 * 3);
          return;
        }

        return resP();
      }
      verify();
    }).catch(() => {
      console.log("Error, campanha não encontrada!");
      return rej();
    });

    const countClientsWA = props.clientsWA.length;

    if (!countClientsWA) {
      return rej({
        message: "Conexões WA não encontradas ou estão off-line",
        id: props.campaignId,
      });
    }
    const listContacts = await getContactWAOfCampaign({
      campaignId: props.campaignId,
      status: "running",
    });

    if (!listContacts) {
      console.log("Lista de contatos vazia");
      return;
    }

    const campaignFind = await prisma.campaign.findUnique({
      where: {
        id: props.campaignId,
        status: { in: ["processing", "running"] },
      },
      select: {
        accountId: true,
        Account: {
          select: {
            AccountAssetsUsed: { select: { marketingSends: true, id: true } },
            Plan: {
              select: {
                PlanAssets: { select: { marketingSends: true } },
              },
            },
          },
        },
        flowId: true,
        name: true,
        CampaignParameter: {
          select: {
            sendDuringHoliday: true,
            RootCampaignParameterRangesConfig: {
              select: {
                timeRest: true,
                amountShorts: true,
                timeForShorts: true,
              },
            },
            TimesWork: {
              where: { type: "campaign_parameter" },
              select: { startTime: true, endTime: true, dayOfWeek: true },
            },
          },
        },
      },
    });

    if (!campaignFind) {
      return rej({ message: "Campanha não encontrada", id: props.campaignId });
    }

    const flow = await ModelFlows.aggregate([
      {
        $match: { accountId: campaignFind.accountId, _id: campaignFind.flowId },
      },
      {
        $project: {
          nodes: {
            $map: {
              input: "$data.nodes",
              in: {
                id: "$$this.id",
                type: "$$this.type",
                data: "$$this.data",
              },
            },
          },
          edges: {
            $map: {
              input: "$data.edges",
              in: {
                id: "$$this.id",
                source: "$$this.source",
                target: "$$this.target",
                sourceHandle: "$$this.sourceHandle",
              },
            },
          },
        },
      },
    ]);

    if (!flow.length) {
      return rej({
        message: "Fluxo de conversão não encontrado para a campanha",
        name: campaignFind.name,
        id: props.campaignId,
      });
    }

    const { edges, nodes } = flow[0];

    if (!campaignFind?.CampaignParameter) {
      return rej({
        message:
          "Configuração do parametros de intervalo não encontrados para a campanha",
        name: campaignFind.name,
        id: props.campaignId,
      });
    }

    const { TimesWork, sendDuringHoliday } = campaignFind.CampaignParameter;
    const parametersRoot =
      campaignFind.CampaignParameter.RootCampaignParameterRangesConfig;

    const flowsMap = new Map();
    flowsMap.set("current", { nodes, edges });

    const nMax =
      countClientsWA > listContacts.length
        ? countClientsWA
        : listContacts.length;
    const nMin =
      countClientsWA > listContacts.length
        ? listContacts.length
        : countClientsWA;
    console.log("10");

    const contactsChunk = chunk(listContacts, Math.floor(nMax / nMin));

    for (let i = 0; i < props.clientsWA.length; i++) {
      let shorts = 0;
      let totalShorts = 0;

      const infoConnection = await prisma.connectionOnBusiness.findUnique({
        where: { id: props.clientsWA[i]?.connectionId },
        select: { number: true, Business: { select: { name: true } } },
      });

      if (!infoConnection) {
        console.log("Não foi encontrada as informações da conexão");
        return;
      }

      const contactsOfConnection = contactsChunk[i];
      if (!contactsOfConnection?.length) {
        console.log("Não a contatos para receber a campanha");
        return;
      }
      for await (const contact of contactsOfConnection) {
        // uma promise que serve para verificar se o business, conexão, campanha esta em ordem.
        // fica aqui atrasada até que

        // quando atrasar o pagamento, seria interessante fazer todas as contas de recursos sendo usado e fazer a
        // interrupção
        // setar como interrompido cada recurso sobrando
        // assim não precisaria de uma rotina para ficar verificando;
        // teria apenas uma promise que fica buscando esse status intererompido do recurso até que seja normalizado,
        // caso contrario atrasa a execução até que seja normalizado ou que o valor de interrompido seja false
        await new Promise((resCheckDay: any) => {
          const checkDay = async () => {
            if (!sendDuringHoliday) {
              const currentDate = moment()
                .tz("America/Sao_Paulo")
                .format("YYYY-MM-DD");
              const currentHoliday = holidaysList.some((e) =>
                e.date.includes(currentDate)
              );
              const hour = 1000 * 60 * 60;
              const missingHours =
                Math.abs(moment().tz("America/Sao_Paulo").hour() - 23) + 1;
              const hoursToMilliseconds = hour * missingHours;
              if (currentHoliday) {
                scheduleJob(
                  moment()
                    .tz("America/Sao_Paulo")
                    .add(hoursToMilliseconds, "milliseconds")
                    .toDate(),
                  checkDay
                );
              }
            }

            if (TimesWork?.length) {
              const validTime = TimesWork.some((day) => {
                const nowTime = moment().tz("America/Sao_Paulo");
                const currentDayWeek = nowTime.get("weekday");

                if (day.dayOfWeek === currentDayWeek) {
                  if (day.startTime && day.endTime) {
                    return nowTime.isBetween(
                      getTimeBR(day.startTime),
                      getTimeBR(day.endTime)
                    );
                  } else {
                    return true;
                  }
                }
              });

              if (validTime) {
                return resCheckDay();
              } else {
                const millisecondsToNextExecutionInQueue = Math.min(
                  ...TimesWork.map((day) => {
                    const nowDate = moment().tz("America/Sao_Paulo");
                    const nextDayWeek = nowDate.startOf("day").set({
                      weekday: day.dayOfWeek,
                      ...(day.startTime &&
                        day.endTime && {
                          hours: Number(day.startTime.slice(0, 2)),
                          minutes: Number(day.startTime.slice(3, 5)),
                        }),
                    });

                    return nextDayWeek.diff(
                      moment().tz("America/Sao_Paulo"),
                      "milliseconds"
                    );
                  }).filter((s) => s >= 0)
                );

                scheduleJob(
                  moment()
                    .tz("America/Sao_Paulo")
                    .add(millisecondsToNextExecutionInQueue, "milliseconds")
                    .toDate(),
                  checkDay
                );
              }
            } else {
              return resCheckDay();
            }
          };
          checkDay();
        });

        if (shorts === parametersRoot.amountShorts) {
          await new Promise((res: any) =>
            setTimeout(() => {
              shorts = 0;
              res();
            }, parametersRoot.timeRest)
          );
        }

        const indexClientsWA = props.clientsWA[i];
        if (!indexClientsWA) return;

        // esse codigo resolve o problema de encontrar o estatdo do lead na campanha
        // tbm resolve para o ondemand
        await prisma.flowState.update({
          where: { id: contact.flowStateId },
          data: {
            connectionOnBusinessId: indexClientsWA.connectionId,
            contactsWAOnAccountId: contact.contactsWAOnAccountId,
            isSent: true,
            flowId: campaignFind.flowId,
            firedOnDate: new Date(),
          },
        });

        if (campaignFind.Account.Plan) {
          if (
            campaignFind.Account.AccountAssetsUsed.marketingSends <=
            campaignFind.Account.Plan.PlanAssets.marketingSends
          ) {
            await prisma.accountAssetsUsed.update({
              where: { id: campaignFind.Account.AccountAssetsUsed.id },
              data: { marketingSends: { increment: 1 } },
            });
            NodeControler({
              businessName: infoConnection?.Business.name!,
              connectionWhatsId: indexClientsWA.connectionId,
              clientWA: indexClientsWA.bot!,
              lead: {
                number:
                  contact.completeNumber.replace("+", "") + "@s.whatsapp.net",
              },
              accountId: campaignFind.accountId,
              flowId: campaignFind.flowId,
              numberConnection: infoConnection.number! + "@s.whatsapp.net",
              type: "initial",
              campaignId: props.campaignId,
              contactsWAOnAccountId: contact.contactsWAOnAccountId,
              flowStateId: contact.flowStateId,
              nodes: flowsMap.get("current").nodes,
              edges: flowsMap.get("current").edges,
              currentNodeId: contact.indexNode ?? "0",
              onEnterNode: async (id) => {
                await prisma.flowState
                  .update({
                    where: { id: contact.flowStateId },
                    data: { indexNode: id },
                  })
                  .catch((err) => console.log(err));
              },
              onErrorNumber: async () => {
                console.log("Numero deu error");
                await prisma.flowState.update({
                  where: { id: contact.flowStateId },
                  data: { isFinish: true },
                });
                // verificar se todos foram encerrados
                const contactsInFlow = await prisma.flowState.count({
                  where: {
                    isFinish: false,
                    Campaign: { id: props.campaignId },
                  },
                });
                if (!contactsInFlow) {
                  await prisma.campaign.update({
                    where: { id: props.campaignId },
                    data: { status: "finished" },
                  });
                  const redis = await clientRedis();
                  const socketId = await redis.get(
                    String(`socketid-${campaignFind.accountId}`)
                  );
                  if (socketId) {
                    socketIo.to(socketId).emit("status-campaign", {
                      campaignId: props.campaignId,
                      status: "finished",
                    });
                  }
                }
              },
              onExecutedNode: async ({ id, type }, isShots) => {
                await prisma.flowState
                  .update({
                    where: { id: contact.flowStateId },
                    data: {
                      indexNode: id,
                      ...(isShots && { isSent: isShots }),
                    },
                  })
                  .catch((err) => console.log(err));
              },
              onFinish: async () => {
                console.log("finalizou");
                await prisma.flowState.update({
                  where: { id: contact.flowStateId },
                  data: { isFinish: true },
                });
                // verificar se todos foram encerrados
                const contactsInFlow = await prisma.flowState.count({
                  where: {
                    isFinish: false,
                    Campaign: { id: props.campaignId },
                  },
                });
                if (!contactsInFlow) {
                  await prisma.campaign.update({
                    where: { id: props.campaignId },
                    data: { status: "finished" },
                  });
                  const redis = await clientRedis();
                  const socketId = await redis.get(
                    String(`socketid-${campaignFind.accountId}`)
                  );
                  if (socketId) {
                    socketIo.to(socketId).emit("status-campaign", {
                      campaignId: props.campaignId,
                      status: "finished",
                    });
                  }
                }
              },
            });
            const nextTimeShorts =
              Math.floor(
                Math.random() * (15000 - parametersRoot.timeForShorts)
              ) + parametersRoot.timeForShorts;
            await new Promise((res: any) => {
              setTimeout(() => {
                totalShorts++;
                shorts++;
                res();
              }, nextTimeShorts);
            });
          } else {
            console.log("BATEU O LIMITE DE DISPAROS");
          }
        }
      }
    }
  });
};
