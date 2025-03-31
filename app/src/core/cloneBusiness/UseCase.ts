import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { CreateCloneBusinessDTO_I } from "./DTO";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { ErrorResponse } from "../../utils/ErrorResponse";

type TotalsAmountExtra = {
  [c in
    | "business"
    | "attendants"
    | "flows"
    | "connections"
    | "chatbotConversations"]?: number;
};

interface BusinessReturn {
  name: string;
  connections: number;
  audiences: number;
  campaigns: number;
  createAt: Date;
  id: number;
}

export class CreateCloneBusinessUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: CreateCloneBusinessDTO_I) {
    // isso aqui é nescessario para fazer o clone;
    // precisamos verificar para não exeder de recursos permitido do plano do ADM
    let newBusiness: BusinessReturn = {
      audiences: 0,
      campaigns: 0,
      connections: 0,
    } as BusinessReturn;

    const businessOld = await prisma.business.findFirst({
      where: { id },
      select: { name: true, description: true },
    });

    if (!businessOld?.name) {
      throw new ErrorResponse(400).toast({
        title: "Negócio não encontrado",
        type: "error",
      });
    }

    newBusiness.name = businessOld.name + "_COPIA_" + new Date().getTime();

    const assets = await prisma.account.findFirst({
      where: { id: accountId },
      select: {
        Plan: {
          select: {
            PlanAssets: {
              select: {
                attendants: true,
                chatbots: true,
                connections: true,
                flow: true,
                business: true,
              },
            },
          },
        },
        AccountSubscriptions: {
          where: { dateOfCancellation: null },
          select: {
            type: true,
            subscriptionsId: true,
            PlanPeriods: {
              select: {
                Plan: {
                  select: {
                    PlanAssets: {
                      select: {
                        attendants: true,
                        chatbots: true,
                        connections: true,
                        flow: true,
                        business: true,
                      },
                    },
                  },
                },
              },
            },
            ExtraPackage: {
              where: {
                type: {
                  in: [
                    "attendants",
                    "flows",
                    "connections",
                    "chatbotConversations",
                    "business",
                  ],
                },
              },
              select: { amount: true, type: true },
            },
          },
        },
      },
    });

    if (assets?.AccountSubscriptions.length) {
      const listExtraAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.ExtraPackage) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            const v = sub.ExtraPackage.amount || 0;
            if (!isValidSub) return { v: v * -1, type: sub.ExtraPackage.type };
            return { v, type: sub.ExtraPackage.type };
          }
        })
      );

      const totalsAmountExtra: TotalsAmountExtra = listExtraAmount.reduce(
        (acc: any, cur) => {
          if (cur) {
            if (!acc[cur.type]) acc[cur.type] = 0;
            acc[cur.type] += cur.v;
            return acc;
          }
        },
        {}
      );

      const listPlanAssetsAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.PlanPeriods) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            const planAssets = sub.PlanPeriods.Plan.PlanAssets;
            if (!isValidSub) {
              return {
                business: (planAssets.business || 0) * -1,
                attendants: (planAssets.attendants || 0) * -1,
                chatbots: (planAssets.chatbots || 0) * -1,
                flow: (planAssets.flow || 0) * -1,
                connections: (planAssets.connections || 0) * -1,
              };
            }
            return {
              business: planAssets.business || 0,
              attendants: planAssets.attendants || 0,
              chatbots: planAssets.chatbots || 0,
              flow: planAssets.flow || 0,
              connections: planAssets.connections || 0,
            };
          }
          0;
        })
      );

      const totalsAmountPlanAssets = listPlanAssetsAmount.reduce(
        (acc, curr) => {
          return {
            attendants: (acc?.attendants || 0) + (curr?.attendants || 0),
            business: (acc?.business || 0) + (curr?.business || 0),
            chatbots: (acc?.chatbots || 0) + (curr?.chatbots || 0),
            connections: (acc?.connections || 0) + (curr?.connections || 0),
            flow: (acc?.flow || 0) + (curr?.flow || 0),
          };
        },
        { attendants: 0, business: 0, chatbots: 0, connections: 0, flow: 0 }
      );

      const business =
        (totalsAmountPlanAssets?.business || 0) +
        (totalsAmountExtra?.business || 0);

      const countResourceBusiness = await prisma.business.count({
        where: { accountId: accountId },
      });

      const rest = business - countResourceBusiness;
      if (rest > 0) {
        if (businessOld) {
          const newBus = await prisma.business.create({
            data: {
              ...businessOld,
              name: newBusiness.name,
              accountId,
            },
            select: { id: true, name: true, createAt: true },
          });
          newBusiness.createAt = newBus.createAt;
          newBusiness.id = newBus.id;
        }
      } else {
        throw new ErrorResponse(400).toast({
          title:
            "Não é possível clonar, pois o limite de negócios foi excedido.",
          type: "error",
        });
      }

      if (dto.flow) {
        const countResource = await ModelFlows.count({
          accountId: accountId,
        });

        const flow =
          (totalsAmountPlanAssets?.flow || 0) + (totalsAmountExtra?.flows || 0);

        const rest = flow - countResource;

        if (rest > 0) {
          const flows = await ModelFlows.find({
            accountId,
            businessIds: { $in: [id] },
          }).limit(rest);

          if (flows.length) {
            for (const flow of flows) {
              let nextId: null | number = null;
              const maxIdDocument = await ModelFlows.findOne(
                {},
                {},
                { sort: { _id: -1 } }
              );
              if (maxIdDocument) {
                nextId = maxIdDocument._id + 1;
              }
              await ModelFlows.create({
                _id: nextId ?? 1,
                type: flow.type,
                businessIds: [newBusiness.id],
                accountId,
                name: flow.name + "_COPIA_" + new Date().getTime(),
                data: flow.data,
              });
            }

            const tags = await prisma.tag.findMany({
              where: {
                accountId,
                TagOnBusiness: { some: { businessId: id } },
              },
              select: { name: true, type: true },
            });

            if (tags.length) {
              for (const tag of tags) {
                await prisma.tag.create({
                  data: {
                    ...tag,
                    accountId,
                    TagOnBusiness: {
                      create: { businessId: newBusiness.id },
                    },
                  },
                });
              }
            }
            // variables
            const vars = await prisma.variable.findMany({
              where: {
                accountId,
                VariableOnBusiness: { some: { businessId: id } },
              },
              select: { name: true, type: true, value: true },
            });

            if (vars.length) {
              for (const varr of vars) {
                await prisma.variable.create({
                  data: {
                    ...varr,
                    accountId,
                    VariableOnBusiness: {
                      create: {
                        businessId: newBusiness.id,
                      },
                    },
                  },
                });
              }
            }
            // checkpoints
            const checks = await prisma.checkPoint.findMany({
              where: {
                accountId,
                CheckPointOnBusiness: {
                  some: { businessId: id },
                },
              },
              select: { name: true, score: true },
            });

            if (checks.length) {
              for (const check of checks) {
                await prisma.checkPoint.create({
                  data: {
                    ...check,
                    accountId,
                    CheckPointOnBusiness: {
                      create: {
                        businessId: newBusiness.id,
                      },
                    },
                  },
                });
              }
            }
            // links
            const links = await prisma.linkTrackingPixel.findMany({
              where: { accountId, businessId: id },
              select: { name: true, link: true },
            });

            if (links.length) {
              for (const link of links) {
                await prisma.linkTrackingPixel.create({
                  data: {
                    ...link,
                    accountId,
                    businessId: newBusiness.id,
                  },
                });
              }
            }
            // numeros - não esta pronto
            // endereços de geo localização - não esta pronto
          }
        }
      }
      if (dto.audience) {
        const audiences = await prisma.audience.findMany({
          where: {
            accountId,
            AudienceOnBusiness: { some: { businessId: id } },
          },
          select: {
            name: true,
            type: true,
            TagOnBusinessOnAudience: { select: { tagOnBusinessId: true } },
            ContactsWAOnAccountOnAudience: {
              select: { contactWAOnAccountId: true },
            },
          },
        });

        if (audiences.length) {
          for await (const audience of audiences) {
            await prisma.audience.create({
              data: {
                accountId,
                name: audience.name + "_COPIA_" + new Date().getTime(),
                type: audience.type,
                AudienceOnBusiness: {
                  create: { businessId: newBusiness.id },
                },
                ContactsWAOnAccountOnAudience: {
                  createMany: {
                    data: audience.ContactsWAOnAccountOnAudience.map(
                      ({ contactWAOnAccountId }) => ({
                        contactWAOnAccountId,
                      })
                    ),
                  },
                },
                TagOnBusinessOnAudience: {
                  createMany: {
                    data: audience.TagOnBusinessOnAudience.map(
                      ({ tagOnBusinessId }) => ({ tagOnBusinessId })
                    ),
                  },
                },
              },
            });
            newBusiness.audiences = audiences.length;
          }
        }
      }
      if (dto.connection) {
        const connections =
          (totalsAmountPlanAssets?.connections || 0) +
          (totalsAmountExtra?.connections || 0);
        const countResource = await prisma.connectionOnBusiness.count({
          where: { Business: { accountId } },
        });
        const rest = connections - countResource;

        if (rest > 0) {
          const conns = await prisma.connectionOnBusiness.findMany({
            where: { Business: { id, accountId } },
            take: rest,
            select: { name: true, type: true, ConnectionConfig: true },
          });

          if (conns.length) {
            for await (const { ConnectionConfig, ...con } of conns) {
              await prisma.connectionOnBusiness.create({
                data: {
                  ...con,
                  name: con.name + "_COPIA_" + new Date().getTime(),
                  businessId: newBusiness?.id,
                  ...(ConnectionConfig && {
                    ConnectionConfig: {
                      create: ConnectionConfig,
                    },
                  }),
                },
              });
            }
            newBusiness.connections = conns.length;
          }
        }
      }
      if (dto.sector) {
        const sectors = await prisma.sectors.findMany({
          where: { accountId, businessId: id },
          select: {
            name: true,
            addTag: true,
            fromTime: true,
            LackResponses: {
              select: {
                finish: true,
                sectorsId: true,
                sendFlow: true,
                sendMessage: true,
                sendSector: true,
                typeBehavior: true,
                typeDuration: true,
                valueDuration: true,
              },
            },
            maximumService: true,
            messageOutsideOfficeHours: true,
            typeDistribution: true,
            toTime: true,
            timeToSendToAllSectors: true,
            operatingDays: true,
            previewPhone: true,
            removeTicket: true,
            signBusiness: true,
          },
        });

        if (sectors.length) {
          for await (const { LackResponses, ...sector } of sectors) {
            await prisma.sectors.create({
              data: {
                accountId,
                businessId: newBusiness.id,
                ...(LackResponses && {
                  LackResponses: { create: { ...LackResponses, accountId } },
                }),
                ...sector,
                name: sector.name + "_COPIA_" + new Date().getTime(),
              },
            });
          }
        }
      }
      if (dto.kanban) {
        const kanbans = await prisma.funnelKanban.findMany({
          where: { accountId, businessId: id },
          select: {
            name: true,
            StepsFunnelKanban: {
              select: {
                name: true,
                sequence: true,
              },
            },
          },
        });

        if (kanbans.length) {
          for await (const kanban of kanbans) {
            await prisma.funnelKanban.create({
              data: {
                accountId,
                businessId: newBusiness.id,
                name: kanban.name + "_COPIA_" + new Date().getTime(),
                StepsFunnelKanban: {
                  createMany: {
                    data: kanban.StepsFunnelKanban.map((s) => ({
                      accountId,
                      ...s,
                    })),
                  },
                },
              },
            });
          }
        }
      }
    } else {
      if (assets?.Plan) {
        const countResourceBusiness = await prisma.business.count({
          where: { accountId },
        });

        const rest = assets.Plan.PlanAssets.business - countResourceBusiness;

        if (rest > 0) {
          if (businessOld) {
            const newBus = await prisma.business.create({
              data: {
                ...businessOld,
                name: newBusiness.name,
                accountId,
              },
              select: { id: true, name: true, createAt: true },
            });
            newBusiness.createAt = newBus.createAt;
            newBusiness.id = newBus.id;
          }
        } else {
          throw new ErrorResponse(400).toast({
            title:
              "Não é possível clonar, pois o limite de negócios foi excedido.",
            type: "error",
          });
        }

        if (dto.flow) {
          const countResource = await ModelFlows.count({
            accountId: accountId,
          });

          const rest = assets.Plan.PlanAssets.flow - countResource;

          if (rest > 0) {
            const flows = await ModelFlows.find({
              accountId,
              businessIds: { $in: [id] },
            }).limit(rest);

            if (flows.length) {
              for (const flow of flows) {
                let nextId: null | number = null;
                const maxIdDocument = await ModelFlows.findOne(
                  {},
                  {},
                  { sort: { _id: -1 } }
                );
                if (maxIdDocument) {
                  nextId = maxIdDocument._id + 1;
                }
                await ModelFlows.create({
                  _id: nextId ?? 1,
                  type: flow.type,
                  businessIds: newBusiness.id,
                  accountId,
                  name: flow.name + "_COPIA_" + new Date().getTime(),
                  data: flow.data,
                });
              }
              // tags
              const tags = await prisma.tag.findMany({
                where: {
                  accountId,
                  TagOnBusiness: { some: { businessId: id } },
                },
                select: { name: true, type: true },
              });

              if (tags.length) {
                for (const tag of tags) {
                  await prisma.tag.create({
                    data: {
                      ...tag,
                      name: tag.name + "_COPIA_" + new Date().getTime(),
                      accountId,
                      TagOnBusiness: { create: { businessId: newBusiness.id } },
                    },
                  });
                }
              }
              // variables
              const vars = await prisma.variable.findMany({
                where: {
                  accountId,
                  VariableOnBusiness: { some: { businessId: id } },
                },
                select: { name: true, type: true, value: true },
              });

              if (vars.length) {
                for (const varr of vars) {
                  await prisma.variable.create({
                    data: {
                      ...varr,
                      name: varr.name + "_COPIA_" + new Date().getTime(),
                      accountId,
                      VariableOnBusiness: {
                        create: {
                          businessId: newBusiness.id,
                        },
                      },
                    },
                  });
                }
              }
              // checkpoints
              const checks = await prisma.checkPoint.findMany({
                where: {
                  accountId,
                  CheckPointOnBusiness: {
                    some: { businessId: id },
                  },
                },
                select: { name: true, score: true },
              });

              if (checks.length) {
                for (const check of checks) {
                  await prisma.checkPoint.create({
                    data: {
                      ...check,
                      name: check.name + "_COPIA_" + new Date().getTime(),
                      accountId,
                      CheckPointOnBusiness: {
                        create: {
                          businessId: newBusiness.id,
                        },
                      },
                    },
                  });
                }
              }
              // links
              const links = await prisma.linkTrackingPixel.findMany({
                where: { accountId, businessId: id },
                select: { name: true, link: true },
              });

              if (links.length) {
                for (const link of links) {
                  await prisma.linkTrackingPixel.create({
                    data: {
                      ...link,
                      link: link.name + "_COPIA_" + new Date().getTime(),
                      accountId,
                      businessId: newBusiness.id,
                    },
                  });
                }
              }
              // numeros - não esta pronto
              // endereços de geo localização - não esta pronto
            }
          }
        }

        if (dto.audience) {
          const audiences = await prisma.audience.findMany({
            where: {
              accountId,
              AudienceOnBusiness: { some: { businessId: id } },
            },
            select: {
              name: true,
              type: true,
              TagOnBusinessOnAudience: { select: { tagOnBusinessId: true } },
              ContactsWAOnAccountOnAudience: {
                select: { contactWAOnAccountId: true },
              },
            },
          });

          if (audiences.length) {
            for await (const audience of audiences) {
              await prisma.audience.create({
                data: {
                  accountId,
                  name: audience.name + "_COPIA_" + new Date().getTime(),
                  type: audience.type,
                  AudienceOnBusiness: {
                    create: { businessId: newBusiness.id },
                  },
                  ContactsWAOnAccountOnAudience: {
                    createMany: {
                      data: audience.ContactsWAOnAccountOnAudience.map(
                        ({ contactWAOnAccountId }) => ({
                          contactWAOnAccountId,
                        })
                      ),
                    },
                  },
                  TagOnBusinessOnAudience: {
                    createMany: {
                      data: audience.TagOnBusinessOnAudience.map(
                        ({ tagOnBusinessId }) => ({ tagOnBusinessId })
                      ),
                    },
                  },
                },
              });
            }
            newBusiness.audiences = audiences.length;
          }
        }

        if (dto.connection) {
          const countResource = await prisma.connectionOnBusiness.count({
            where: { Business: { accountId } },
          });

          const rest = assets.Plan.PlanAssets.connections - countResource;

          if (rest > 0) {
            const conns = await prisma.connectionOnBusiness.findMany({
              where: { Business: { id, accountId } },
              take: rest,
              select: { name: true, type: true, ConnectionConfig: true },
            });

            if (conns.length) {
              for await (const { ConnectionConfig, ...con } of conns) {
                await prisma.connectionOnBusiness.create({
                  data: {
                    ...con,
                    name: con.name + "_COPIA_" + new Date().getTime(),
                    businessId: newBusiness.id,
                    ...(ConnectionConfig && {
                      ConnectionConfig: {
                        create: ConnectionConfig,
                      },
                    }),
                  },
                });
              }
            }
            newBusiness.connections = conns.length;
          }
        }

        if (dto.sector) {
          const sectors = await prisma.sectors.findMany({
            where: { accountId, businessId: id },
            select: {
              name: true,
              addTag: true,
              fromTime: true,
              LackResponses: {
                select: {
                  finish: true,
                  sectorsId: true,
                  sendFlow: true,
                  sendMessage: true,
                  sendSector: true,
                  typeBehavior: true,
                  typeDuration: true,
                  valueDuration: true,
                },
              },
              maximumService: true,
              messageOutsideOfficeHours: true,
              typeDistribution: true,
              toTime: true,
              timeToSendToAllSectors: true,
              operatingDays: true,
              previewPhone: true,
              removeTicket: true,
              signBusiness: true,
            },
          });

          if (sectors.length) {
            for await (const { LackResponses, ...sector } of sectors) {
              await prisma.sectors.create({
                data: {
                  accountId,
                  businessId: newBusiness.id,
                  ...(LackResponses && {
                    LackResponses: { create: { ...LackResponses, accountId } },
                  }),
                  ...sector,
                  name: sector.name + "_COPIA_" + new Date().getTime(),
                },
              });
            }
          }
        }

        if (dto.kanban) {
          const kanbans = await prisma.funnelKanban.findMany({
            where: { accountId, businessId: id },
            select: {
              name: true,
              StepsFunnelKanban: {
                select: {
                  name: true,
                  sequence: true,
                },
              },
            },
          });

          if (kanbans.length) {
            for await (const kanban of kanbans) {
              await prisma.funnelKanban.create({
                data: {
                  accountId,
                  businessId: newBusiness.id,
                  name: kanban.name + "_COPIA_" + new Date().getTime(),
                  StepsFunnelKanban: {
                    createMany: {
                      data: kanban.StepsFunnelKanban.map((s) => ({
                        accountId,
                        ...s,
                      })),
                    },
                  },
                },
              });
            }
          }
        }
      }
    }

    return {
      message: "OK!",
      status: 200,
      business: { ...newBusiness, connections: 0 },
    };
  }
}
