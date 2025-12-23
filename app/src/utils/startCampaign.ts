import { chunk } from "underscore";
import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { prisma } from "../adapters/Prisma/client";
import { ModelFlows } from "../adapters/mongo/models/flows";
import { socketIo } from "../infra/express";
import { NodeControler } from "../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../adapters/Baileys";
import { cacheFlowsMap } from "../adapters/Baileys/Cache";
import { cacheAccountSocket } from "../infra/websocket/cache";
import { mongo } from "../adapters/mongo/connection";

interface PropsStartCampaign {
  id: number;
  connectionIds?: number[];
}

function getTimeBR(time: string) {
  return moment()
    .tz("America/Sao_Paulo")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

export const startCampaign = async ({
  id,
  connectionIds,
}: PropsStartCampaign): Promise<void> => {
  return new Promise(async (res, rej) => {
    const campaign = await new Promise<{
      ShootingSpeed: {
        numberShots: number;
        timeBetweenShots: number;
        timeRest: number;
      };
      OperatingDays: {
        dayOfWeek: number;
        WorkingTimes: {
          start: string;
          end: string;
        }[];
      }[];
      connectionIds: number[];
      accountId: number;
      flowId: string;
    }>(async (resP) => {
      async function verify(): Promise<void> {
        const campaign = await prisma.campaign.findFirst({
          where: { id },
          select: {
            flowId: true,
            accountId: true,
            OperatingDays: {
              select: {
                dayOfWeek: true,
                WorkingTimes: { select: { start: true, end: true } },
              },
            },
            ShootingSpeed: {
              select: {
                numberShots: true,
                timeBetweenShots: true,
                timeRest: true,
              },
            },
            ConnectionOnCampaign: {
              select: {
                ConnectionWA: { select: { interrupted: true, id: true } },
              },
            },
            CampaignOnBusiness: {
              select: { Business: { select: { interrupted: true } } },
            },
          },
        });

        if (!campaign) return rej();

        const allBusinessInterruped = campaign.CampaignOnBusiness.map(
          (s) => s.Business.interrupted
        ).every((s) => s);

        if (allBusinessInterruped) {
          setTimeout(() => verify, 1000 * 60 * 3);
          return;
        }

        const allConnectionsInterruped = campaign.ConnectionOnCampaign.map(
          (s) => s.ConnectionWA.interrupted
        ).every((s) => s);

        if (allConnectionsInterruped) {
          setTimeout(() => verify, 1000 * 60 * 3);
          return;
        }

        return resP({
          ShootingSpeed: campaign.ShootingSpeed,
          accountId: campaign.accountId,
          flowId: campaign.flowId,
          OperatingDays: campaign.OperatingDays,
          connectionIds: campaign.ConnectionOnCampaign.map(
            (s) => s.ConnectionWA.id
          ),
        });
      }
      verify();
    });

    let originalConnections: number[] = [];
    if (connectionIds?.length) {
      originalConnections = connectionIds;
    } else {
      originalConnections = campaign.connectionIds;
    }

    const clientsWA = originalConnections
      .map((id) => {
        const connection = sessionsBaileysWA.get(id);
        if (sessionsBaileysWA.get(id) && connection)
          return {
            bot: connection,
            id,
            status: true,
            flowStates: [] as {
              status: boolean;
              id: number;
              indexNode: string | null;
              flowId: string | null;
              connectionWAId: number | null;
              ContactsWAOnAccount: {
                id: number;
                ContactsWA: {
                  completeNumber: string;
                };
              } | null;
            }[],
          };
      })
      .filter((s) => s);

    if (!clientsWA.length) {
      return rej({
        message: "Conexões WA não encontradas ou estão off-line",
        id,
      });
    }

    const flowStates = await prisma.flowState.findMany({
      where: {
        campaignId: id,
        isFinish: false,
        Campaign: { status: { in: ["processing", "running"] } },
      },
      select: {
        id: true,
        indexNode: true,
        ContactsWAOnAccount: {
          select: {
            id: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
        flowId: true,
        connectionWAId: true,
      },
    });

    const nextFlowState = flowStates.map((s) => ({
      ...s,
      status: false, // status para controle interno
    }));

    if (!nextFlowState.length) {
      console.log("Não há FlowStates. Campanha não iniciada ou já finalizada.");
      await prisma.campaign.update({
        where: { id },
        data: { status: "finished" },
      });
    }

    const listFlowStateWithConnection = nextFlowState.filter(
      (s) => s.connectionWAId
    );

    const orderedFlowStateWithConnection = listFlowStateWithConnection.reduce(
      (acc, item) => {
        const existing = acc.find((i) => i.id === item.connectionWAId);
        if (existing) {
          existing.flowStates.push({
            contactsWAOnAccountId: item.ContactsWAOnAccount!.id,
            id: item.id,
            indexNode: item.indexNode,
            flowId: item.flowId,
            completeNumber: item.ContactsWAOnAccount!.ContactsWA.completeNumber,
          });
        } else {
          acc.push({
            id: item.connectionWAId!,
            status: true,
            flowStates: [
              {
                contactsWAOnAccountId: item.ContactsWAOnAccount!.id,
                id: item.id,
                indexNode: item.indexNode,
                flowId: item.flowId,
                completeNumber:
                  item.ContactsWAOnAccount!.ContactsWA.completeNumber,
              },
            ],
          });
        }
        return acc;
      },
      [] as {
        id: number;
        status: boolean;
        flowStates: {
          id: number;
          flowId: string | null;
          contactsWAOnAccountId: number | null;
          completeNumber: string | null;
          indexNode: string | null;
        }[];
      }[]
    );

    async function checkDay() {
      return await new Promise((resCheckDay: any) => {
        const check = async () => {
          if (campaign.OperatingDays?.length) {
            const validTime = campaign.OperatingDays.some((day) => {
              const nowTime = moment().tz("America/Sao_Paulo");
              const currentDayWeek = nowTime.get("weekday");

              if (day.dayOfWeek === currentDayWeek) {
                if (day.WorkingTimes?.length) {
                  return day.WorkingTimes.some(({ end, start }) => {
                    return nowTime.isBetween(getTimeBR(end), getTimeBR(start));
                  });
                } else {
                  return true;
                }
              }
            });

            if (validTime) {
              return resCheckDay();
            } else {
              const minutesToNextExecutionInQueue = Math.min(
                ...campaign.OperatingDays.map((day) => {
                  const nowDate = moment().tz("America/Sao_Paulo");

                  const listNextWeeks = day.WorkingTimes.map((time) => {
                    const nextDayWeek = nowDate.startOf("day").set({
                      weekday: day.dayOfWeek,
                      hours: Number(time.start.slice(0, 2)),
                      minutes: Number(time.start.slice(3, 5)),
                    });
                    return nextDayWeek.diff(
                      moment().tz("America/Sao_Paulo"),
                      "minutes"
                    );
                  });

                  return Math.min(...listNextWeeks);
                }).filter((s) => s >= 0)
              );

              scheduleJob(
                moment()
                  .tz("America/Sao_Paulo")
                  .add(minutesToNextExecutionInQueue, "minutes")
                  .toDate(),
                checkDay
              );
            }
          } else {
            return resCheckDay();
          }
        };
        check();
      });
    }

    // chamar o fluxo para cada conexão que já tem flowState
    for (const connection of orderedFlowStateWithConnection) {
      const connectionWA = sessionsBaileysWA.get(connection.id);
      if (!connectionWA) {
        console.log(
          `Conexão WA com ID ${connection.id} não encontrada ou está off-line`
        );
        continue;
      }

      const infoConnection = await prisma.connectionWA.findUnique({
        where: { id: connection.id },
        select: { number: true, Business: { select: { name: true } } },
      });

      if (!infoConnection) {
        console.log("Conexão não encontrada.");
        continue;
      }

      if (!connection.flowStates.length) {
        console.log("Não a contatos para receber a campanha");
        continue;
      }

      let shorts = 0;
      let totalShorts = 0;

      for await (let stateFlow of connection.flowStates) {
        if (!connection.status) {
          await prisma.flowState.update({
            where: { id: stateFlow.id },
            data: { isFinish: true },
          });
          continue;
        }
        await checkDay();

        if (shorts === campaign.ShootingSpeed.numberShots) {
          await new Promise((res: any) =>
            setTimeout(() => {
              shorts = 0;
              res();
            }, campaign.ShootingSpeed.timeRest)
          );
        }

        await prisma.flowState.update({
          where: { id: stateFlow.id },
          data: {
            connectionWAId: connection.id,
            isSent: true,
            firedOnDate: new Date(),
          },
        });

        const socketsAccount = cacheAccountSocket.get(campaign.accountId);
        socketsAccount?.listSocket?.forEach((sockId) =>
          socketIo.to(sockId).emit(`sentCount-campaign`, {
            id,
            increment: 1,
          })
        );

        if (
          !stateFlow.completeNumber ||
          !stateFlow.contactsWAOnAccountId ||
          !stateFlow.flowId
        ) {
          console.log("Dados incompletos no FlowState, não será processado.");
          await prisma.flowState.update({
            where: { id: stateFlow.id },
            data: { isFinish: true },
          });
          return;
        }

        let flow = cacheFlowsMap.get(stateFlow.flowId);
        if (!flow) {
          await mongo();
          const findFlow = await ModelFlows.aggregate([
            { $match: { accountId: campaign.accountId, _id: campaign.flowId } },
            {
              $project: {
                businessIds: 1,
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
          const { nodes, edges, businessIds } = findFlow[0] || {};
          flow = { nodes, edges, businessIds };
        }

        if (!flow) {
          return rej({
            message: "Fluxo de conversão não encontrado para a campanha",
            id,
          });
        }

        NodeControler({
          businessName: infoConnection?.Business.name!,
          connectionWhatsId: connection.id,
          clientWA: connectionWA,
          action: null,
          lead: { number: stateFlow.completeNumber },
          oldNodeId: stateFlow.indexNode || "0",
          accountId: campaign.accountId,
          flowId: campaign.flowId,
          numberConnection: infoConnection.number! + "@s.whatsapp.net",
          type: "initial",
          campaignId: id,
          contactsWAOnAccountId: stateFlow.contactsWAOnAccountId,
          flowStateId: stateFlow.id,
          nodes: flow.nodes,
          edges: flow.edges,
          currentNodeId: stateFlow.indexNode || "0",
          actions: {
            onEnterNode: async (data) => {
              await prisma.flowState
                .update({
                  where: { id: stateFlow.id },
                  data: { indexNode: data.id, flowId: data.flowId },
                })
                .catch((err) => console.log(err));
            },
            onErrorNumber: async () => {
              await prisma.flowState.update({
                where: { id: stateFlow.id },
                data: { isFinish: true },
              });
              const contactsInFlow = await prisma.flowState.count({
                where: { isFinish: false, campaignId: id },
              });
              if (!contactsInFlow) {
                await prisma.campaign.update({
                  where: { id },
                  data: { status: "finished" },
                });
                cacheAccountSocket
                  .get(campaign.accountId)
                  ?.listSocket?.forEach((sockId) =>
                    socketIo.to(sockId).emit("status-campaign", {
                      id,
                      status: "finished",
                    })
                  );
              }
            },
            onExecutedNode: async (data) => {
              await prisma.flowState
                .update({
                  where: { id: stateFlow.id },
                  data: { indexNode: data.id, flowId: data.flowId },
                })
                .catch((err) => console.log(err));
            },
            onFinish: async () => {
              await prisma.flowState.update({
                where: { id: stateFlow.id },
                data: { isFinish: true },
              });
              // enviar socket de finishPercentage;
              const contactsInFlow = await prisma.flowState.count({
                where: {
                  isFinish: false,
                  Campaign: { id },
                },
              });
              if (!contactsInFlow) {
                await prisma.campaign.update({
                  where: { id },
                  data: { status: "finished" },
                });
                cacheAccountSocket
                  .get(campaign.accountId)
                  ?.listSocket?.forEach((sockId) =>
                    socketIo.to(sockId).emit("status-campaign", {
                      id,
                      status: "finished",
                    })
                  );
              }
            },
            onErrorClient: async (indexN) => {
              await prisma.flowState.update({
                where: { id: stateFlow.id },
                data: { isFinish: true },
              });
              const contactsInFlow = await prisma.flowState.count({
                where: {
                  isFinish: false,
                  Campaign: { id },
                },
              });
              if (!contactsInFlow) {
                await prisma.campaign.update({
                  where: { id },
                  data: { status: "finished" },
                });
                cacheAccountSocket
                  .get(campaign.accountId)
                  ?.listSocket?.forEach((sockId) =>
                    socketIo.to(sockId).emit("status-campaign", {
                      id,
                      status: "finished",
                    })
                  );
              }
            },
          },
        });
        const nextTimeShorts =
          Math.floor(
            Math.random() * (15000 - campaign.ShootingSpeed.timeBetweenShots)
          ) + campaign.ShootingSpeed.timeBetweenShots;
        await new Promise((res: any) => {
          setTimeout(() => {
            totalShorts++;
            shorts++;
            res();
          }, nextTimeShorts);
        });
      }
    }

    const listFlowStateWithoutConnection = nextFlowState.filter(
      (s) => !s.connectionWAId
    );

    if (!listFlowStateWithoutConnection.length) {
      console.log("Não há FlowStates sem conexão, então não há o que fazer...");
      return;
    }

    let flow = cacheFlowsMap.get(campaign.flowId);
    if (!flow) {
      const findFlow = await ModelFlows.aggregate([
        { $match: { accountId: campaign.accountId, _id: campaign.flowId } },
        {
          $project: {
            businessIds: 1,
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
      const { nodes, edges, businessIds } = findFlow[0] || {};
      flow = { nodes, edges, businessIds };
    }

    if (!flow) {
      return rej({
        message: "Fluxo de conversão não encontrado para a campanha",
        id,
      });
    }

    const nMax =
      clientsWA.length > listFlowStateWithoutConnection.length
        ? clientsWA.length
        : listFlowStateWithoutConnection.length;
    const nMin =
      clientsWA.length > listFlowStateWithoutConnection.length
        ? listFlowStateWithoutConnection.length
        : clientsWA.length;

    const statesFlowChunk = chunk(
      listFlowStateWithoutConnection,
      Math.floor(nMax / nMin)
    );

    for (let index = 0; index < clientsWA.length; index++) {
      clientsWA[index]!.flowStates = statesFlowChunk[index] || [];
    }

    for (let i = 0; i < clientsWA.length; i++) {
      let shorts = 0;
      let totalShorts = 0;

      const infoConnection = await prisma.connectionWA.findUnique({
        where: { id: clientsWA[i]!.id },
        select: { number: true, Business: { select: { name: true } } },
      });

      if (!infoConnection) {
        console.log("Conexão não encontrada.");
        continue;
      }

      if (!clientsWA[i]!.flowStates.length) {
        console.log("Não a contatos para receber a campanha");
        continue;
      }

      for await (let stateFlow of clientsWA[i]!.flowStates) {
        if (!clientsWA[i]?.status) {
          console.log("Conexão WA ficou invalida.");
          continue;
        }
        await checkDay();

        if (shorts === campaign.ShootingSpeed.numberShots) {
          await new Promise((res: any) =>
            setTimeout(() => {
              shorts = 0;
              res();
            }, campaign.ShootingSpeed.timeRest)
          );
        }

        if (!clientsWA[i]) return;

        await prisma.flowState.update({
          where: { id: stateFlow.id },
          data: {
            connectionWAId: clientsWA[i]!.id,
            isSent: true,
            firedOnDate: new Date(),
          },
        });

        const socketsAccount = cacheAccountSocket.get(campaign.accountId);
        socketsAccount?.listSocket?.forEach((sockId) =>
          socketIo.to(sockId).emit(`sentCount-campaign`, {
            id,
            increment: 1,
          })
        );

        stateFlow.status = true;
        NodeControler({
          businessName: infoConnection?.Business.name!,
          connectionWhatsId: clientsWA[i]!.id,
          clientWA: clientsWA[i]!.bot!,
          action: null,
          lead: {
            number: stateFlow.ContactsWAOnAccount!.ContactsWA.completeNumber,
          },
          oldNodeId: stateFlow.indexNode || "0",
          accountId: campaign.accountId,
          flowId: campaign.flowId,
          numberConnection: infoConnection.number! + "@s.whatsapp.net",
          type: "initial",
          campaignId: id,
          contactsWAOnAccountId: stateFlow.ContactsWAOnAccount!.id,
          flowStateId: stateFlow.id,
          nodes: flow.nodes,
          edges: flow.edges,
          currentNodeId: stateFlow.indexNode || "0",
          actions: {
            onEnterNode: async (data) => {
              await prisma.flowState
                .update({
                  where: { id: stateFlow.id },
                  data: { indexNode: data.id },
                })
                .catch((err) => console.log(err));
            },
            onErrorNumber: async () => {
              await prisma.flowState.update({
                where: { id: stateFlow.id },
                data: { isFinish: true },
              });
              const contactsInFlow = await prisma.flowState.count({
                where: { isFinish: false, campaignId: id },
              });
              if (!contactsInFlow) {
                await prisma.campaign.update({
                  where: { id },
                  data: { status: "finished" },
                });
                cacheAccountSocket
                  .get(campaign.accountId)
                  ?.listSocket?.forEach((sockId) =>
                    socketIo.to(sockId).emit("status-campaign", {
                      id,
                      status: "finished",
                    })
                  );
              }
            },
            onExecutedNode: async (data) => {
              await prisma.flowState
                .update({
                  where: { id: stateFlow.id },
                  data: { indexNode: data.id },
                })
                .catch((err) => console.log(err));
            },
            onFinish: async () => {
              await prisma.flowState.update({
                where: { id: stateFlow.id },
                data: { isFinish: true },
              });
              const contactsInFlow = await prisma.flowState.count({
                where: {
                  isFinish: false,
                  Campaign: { id },
                },
              });
              if (!contactsInFlow) {
                await prisma.campaign.update({
                  where: { id },
                  data: { status: "finished" },
                });
                cacheAccountSocket
                  .get(campaign.accountId)
                  ?.listSocket?.forEach((sockId) =>
                    socketIo.to(sockId).emit("status-campaign", {
                      id,
                      status: "finished",
                    })
                  );
              }
            },
            onErrorClient: async (indexN) => {
              clientsWA[i]!.status = false;
              const getNextConnection = async () => {
                const nextConnections = clientsWA.filter((c) => c!.status);
                if (nextConnections.length === 0) {
                  console.log("Não há outras conexões disponíveis.");
                  await prisma.campaign.update({
                    where: { id },
                    data: { status: "finished" },
                  });
                  return;
                }
                const nextConnection = clientsWA.findIndex(
                  (s) => s!.id === nextConnections[0]!?.id
                );
                const isSending = clientsWA[nextConnection]!.flowStates.some(
                  (c) => c.status === false
                );
                if (isSending) {
                  const awaitedSF = clientsWA[i]!.flowStates.filter(
                    (s) => s.status === false
                  );
                  clientsWA[nextConnection]!.flowStates = [
                    ...clientsWA[nextConnection]!.flowStates,
                    ...awaitedSF.map((s) => ({
                      ...s,
                      status: false,
                      connectionWAId: clientsWA[nextConnection]!.id,
                    })),
                  ];
                  for (const awaited of awaitedSF) {
                    await prisma.flowState.update({
                      where: { id: awaited.id },
                      data: { connectionWAId: clientsWA[nextConnection]!.id },
                    });
                  }
                  return;
                }
                if (nextConnections.length > 1) {
                  // seta o cliente como false, pq ele ja envou todas os flowStates
                  clientsWA[nextConnection]!.status = false;
                  return getNextConnection();
                }
                if (nextConnections.length === 1) {
                  const awaitedSF = clientsWA[i]!.flowStates.filter(
                    (s) => s.status === false
                  );
                  for (const awaited of awaitedSF) {
                    await prisma.flowState.update({
                      where: { id: awaited.id },
                      data: { connectionWAId: clientsWA[nextConnection]!.id },
                    });
                  }
                  if (indexN === "0") {
                    await prisma.flowState.update({
                      where: { id: stateFlow.id },
                      data: { connectionWAId: clientsWA[nextConnection]!.id },
                    });
                    // mesmo que não tenha outros flow aguardando tenho que
                    // chamar a campanha pra esse unico flow que tava no start ainda...
                    startCampaign({
                      id,
                      connectionIds: [clientsWA[nextConnection]!.id],
                    });
                    return;
                  }
                  if (awaitedSF.length) {
                    await prisma.flowState.update({
                      where: { id: stateFlow.id },
                      data: { isFinish: true },
                    });
                    startCampaign({
                      id,
                      connectionIds: [clientsWA[nextConnection]!.id],
                    });
                    return;
                  }
                }
              };
              getNextConnection();
            },
          },
        });
        const nextTimeShorts =
          Math.floor(
            Math.random() * (15000 - campaign.ShootingSpeed.timeBetweenShots)
          ) + campaign.ShootingSpeed.timeBetweenShots;
        await new Promise((res: any) => {
          setTimeout(() => {
            totalShorts++;
            shorts++;
            res();
          }, nextTimeShorts);
        });
      }
    }
  });
};
