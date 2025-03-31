import { prisma } from "../../../../adapters/Prisma/client";
import { clientRedis } from "../../../../adapters/RedisDB";
import { socketIo } from "../../../../infra/express";
import { AsaasWebHookChargesDTO_I } from "./DTO";
import { AsaasWebHookChargesRepository_I } from "./Repository";
import { sessionsBaileysWA } from "../../../../adapters/Baileys";
import { ModelFlows } from "../../../../adapters/mongo/models/flows";
import { AsaasGetQRCodePixOfPayment } from "../../Payments";
import { PlanAssets } from "@prisma/client";

const cacheCountSalesAffiliates: {
  [x: number]: { count: number };
} = {};

interface IPropsDowngradeAccount {
  assets: Pick<
    PlanAssets,
    | "business"
    | "connections"
    | "users"
    | "attendants"
    | "flow"
    | "marketingSends"
    | "chatbots"
    | "contactsWA"
  >;
  accountId: number;
}

const downgradeAccount = async ({
  assets,
  ...props
}: IPropsDowngradeAccount) => {
  if (!!assets.attendants) {
    const countAtten = await prisma.sectorsAttendants.count({
      where: { accountId: props.accountId },
    });
    if (assets.attendants - countAtten < 0) {
      const pickResources = await prisma.sectorsAttendants.findMany({
        where: { accountId: props.accountId },
        take: Math.abs(assets.attendants - countAtten),
        select: { id: true },
      });
      if (pickResources.length) {
        await prisma.sectorsAttendants.deleteMany({
          where: { id: { in: pickResources.map((s) => s.id) } },
        });
      }
    }
  } else {
    await prisma.sectorsAttendants.deleteMany({
      where: { accountId: props.accountId },
    });
  }
  if (!!assets.chatbots) {
    const countBuss = await prisma.chatbot.count({
      where: { accountId: props.accountId },
    });
    if (assets.chatbots - countBuss < 0) {
      const pickResources = await prisma.chatbot.findMany({
        where: { accountId: props.accountId },
        take: Math.abs(assets.chatbots),
        select: { id: true },
      });
      if (pickResources.length) {
        await prisma.chatbot.deleteMany({
          where: { id: { in: pickResources.map((s) => s.id) } },
        });
      }
    }
  } else {
    await prisma.chatbot.deleteMany({
      where: { accountId: props.accountId },
    });
  }
  if (!!assets.connections) {
    const countBuss = await prisma.connectionOnBusiness.count({
      where: { Business: { accountId: props.accountId } },
    });
    if (assets.connections - countBuss) {
      const pickResources = await prisma.connectionOnBusiness.findMany({
        where: { Business: { accountId: props.accountId } },
        take: Math.abs(assets.connections - countBuss),
        select: { id: true },
      });
      if (pickResources.length) {
        await prisma.connectionOnBusiness.deleteMany({
          where: { id: { in: pickResources.map((s) => s.id) } },
        });
        pickResources.map(({ id }) => {
          const client = sessionsBaileysWA.get(id);
          if (client) {
            client.end(new Error("Desconectado pelo servidor!"));
          }
        });
      }
    }
  } else {
    const pickResources = await prisma.connectionOnBusiness.findMany({
      where: { Business: { accountId: props.accountId } },
      select: { id: true },
    });
    await prisma.connectionOnBusiness.deleteMany({
      where: { id: { in: pickResources.map((s) => s.id) } },
    });
  }
  if (!!assets.users) {
    const countBuss = await prisma.subAccount.count({
      where: { accountId: props.accountId },
    });
    if (assets.users - countBuss < 0) {
      const pickResources = await prisma.subAccount.findMany({
        where: { accountId: props.accountId },
        take: Math.abs(assets.users - countBuss),
        select: { id: true },
      });
      if (pickResources.length) {
        await prisma.subAccount.deleteMany({
          where: { id: { in: pickResources.map((s) => s.id) } },
        });
      }
    }
  } else {
    await prisma.subAccount.deleteMany({
      where: { accountId: props.accountId },
    });
  }
  if (!!assets.business) {
    const countBuss = await prisma.business.count({
      where: { accountId: props.accountId },
    });
    if (assets.business - countBuss < 0) {
      const pickResources = await prisma.business.findMany({
        where: { accountId: props.accountId },
        take: Math.abs(assets.business - countBuss),
        select: { id: true },
      });
      if (pickResources.length) {
        await prisma.business.deleteMany({
          where: { id: { in: pickResources.map((s) => s.id) } },
        });
      }
    }
  } else {
    await prisma.business.deleteMany({
      where: { accountId: props.accountId },
    });
  }
};

export class AsaasWebHookChargesUseCase {
  constructor(private repository: AsaasWebHookChargesRepository_I) {}

  async run(dto: AsaasWebHookChargesDTO_I) {
    try {
      if (dto.event === "SUBSCRIPTION_DELETED") {
        console.log("assinatura FOI APAGADA!");
        const findSub = await prisma.accountSubscriptions.findFirst({
          where: { subscriptionsId: dto.subscription.id },
          select: { id: true, accountId: true },
        });
        if (!findSub) {
          console.log("assinatura NÃO ENCONTRADA!");
          return { message: "Assinatura não encontrada", status: 200 };
        }
        await prisma.accountSubscriptions.update({
          where: { id: findSub.id },
          data: { deleted: true },
        });
        const planFreeDefault = await prisma.plan.findFirst({
          where: { type: "free", isDefault: true },
          select: {
            id: true,
            PlanAssets: {
              select: {
                attendants: true,
                business: true,
                chatbots: true,
                connections: true,
                contactsWA: true,
                flow: true,
                marketingSends: true,
                users: true,
              },
            },
          },
        });
        if (planFreeDefault) {
          await prisma.account.update({
            where: { id: findSub.accountId },
            data: { planId: planFreeDefault.id },
          });

          await downgradeAccount({
            accountId: findSub.accountId,
            assets: planFreeDefault.PlanAssets,
          });
        } else {
          return {
            message: "Assinatura deletada, plano free não encontrado!",
            status: 200,
          };
        }

        return { message: "Assinatura deletada", status: 200 };
      }

      if (dto.event === "SUBSCRIPTION_CREATED") {
        console.log("assinatura CRIADA!");
        const { customer, id, externalReference, billingType, creditCard } =
          dto.subscription;

        const findAccount = await prisma.account.findFirst({
          where: { customerId: customer },
          select: { id: true },
        });

        if (!findAccount) {
          console.log("conta do adm NÃO ENCONTRADA!");
          return { message: "Conta ADM não encontrada", status: 200 };
        }

        // const redis = await clientRedis();
        // const socketAccount = await redis.get(`socketid-${findAccount.id}`);

        if (externalReference) {
          const externalReferenceJSON: {
            periodId?: number;
            extraId?: number;
            couponId?: number;
          } = await JSON.parse(String(externalReference));

          let cardCardId: null | number = null;

          if (creditCard && billingType === "CREDIT_CARD") {
            const findCreditCard = await prisma.creditCardsOnAccount.findFirst({
              where: { token: creditCard.creditCardToken },
              select: { id: true },
            });
            if (findCreditCard) {
              cardCardId = findCreditCard.id;
            } else {
              console.log("CARTÃO NÃO ENCONTRADO!");
            }
          }

          const { PlanPeriods } = await prisma.accountSubscriptions.create({
            data: {
              creditCardId: cardCardId,
              billingType,
              subscriptionsId: id,
              accountId: findAccount.id,
              type: externalReferenceJSON.periodId ? "PLAN" : "EXTRA",
              planPeriodsId: externalReferenceJSON.periodId,
              extraPackageId: externalReferenceJSON.extraId,
              couponId: externalReferenceJSON.couponId,
            },
            select: {
              PlanPeriods: {
                select: {
                  Plan: {
                    select: {
                      id: true,
                      PlanAssets: {
                        select: {
                          attendants: true,
                          business: true,
                          chatbots: true,
                          connections: true,
                          contactsWA: true,
                          flow: true,
                          marketingSends: true,
                          users: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          if (externalReferenceJSON.periodId && PlanPeriods?.Plan.PlanAssets) {
            await this.repository.updatePlanAccount({
              accountId: findAccount.id,
              planId: PlanPeriods.Plan.id,
            });

            await downgradeAccount({
              accountId: findAccount.id,
              assets: PlanPeriods?.Plan.PlanAssets,
            });
          }

          // if (socketAccount) {
          //   socketIo.to(socketAccount).emit("payment-plan-status", {
          //     title: "Assinatura criada com sucesso 🥳.",
          //     event: dto.event,
          //   });
          // }
          return { message: "Assinatura criada com sucesso", status: 200 };
        }
        return { message: "Referencia não encontrada!", status: 200 };
      }

      if (dto.event === "SUBSCRIPTION_UPDATED") {
        // const findSub = await prisma.accountSubscriptions.findFirst({
        //   where: { subscriptionsId: dto.subscription.id },
        //   select: { id: true },
        // });
        // if (!findSub) {
        //   console.log("assinatura NÃO ENCONTRADA!");
        //   return { message: "Assinatura não encontrada", status: 200 };
        // }
        // console.log(dto.subscription);
        return { message: "assinatura não foi atualizada!", status: 200 };
      }

      if (dto.event === "SUBSCRIPTION_INACTIVATED") {
        console.log("assinatura INATIVA!");
        console.log(dto.subscription);
        return { message: "assinatura inativa!", status: 200 };
      }

      if (dto.event === "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED") {
        console.log(
          "Bloqueio da assinatura por divergência de split foi finalizado!"
        );
        console.log(dto.subscription);
        return {
          message:
            "Bloqueio da assinatura por divergência de split foi finalizado!",
          status: 200,
        };
      }

      if (dto.event === "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK") {
        console.log("Assinatura bloqueada por divergência de split!");
        console.log(dto.subscription);
        return {
          message: "Assinatura bloqueada por divergência de split!",
          status: 200,
        };
      }

      if (dto.event === "PAYMENT_CREATED") {
        console.log("cobrança foi CRIADA");
        const { customer, externalReference } = dto.payment;

        const findAccount = await prisma.account.findFirst({
          where: { customerId: customer },
          select: { id: true, isUsedFreeTrialTime: true },
        });

        if (!findAccount) {
          console.log("conta do adm NÃO ENCONTRADA!");
          return { message: "Conta ADM não encontrada", status: 200 };
        }

        const redis = await clientRedis();
        const socketAccount = await redis.get(`socketid-${findAccount.id}`);

        if (externalReference) {
          const externalReferenceJSON: {
            periodId?: number;
            extraId?: number;
            couponId?: number;
          } = await JSON.parse(String(externalReference));

          if (externalReferenceJSON.periodId) {
            const plan = await prisma.plan.findFirst({
              where: {
                PlanPeriods: { some: { id: externalReferenceJSON.periodId } },
              },
            });
            if (!plan) {
              if (socketAccount) {
                socketIo.to(socketAccount).emit("payment-plan-status", {
                  message: "Plano não encontrado",
                  text: `Já fomos notificado sobre o seu problema! Entraremos em contato com você assim que possivel`,
                  status: dto.payment.status,
                  code: 1501,
                });
              }
              return { message: "Plano não encontrado!", status: 200 };
            }
            if (socketAccount) {
              socketIo.to(socketAccount).emit("payment-plan-status", {
                title: "Aguardando a confirmação de pagamento",
                text: `Seu plano será atualizado assim que o pagamento for confirmado`,
                status: dto.payment.status,
                code: 1002,
              });
            }
          }
          if (externalReference.extraId) {
            return {
              message:
                "Aguardando a confirmação de pagamento do recurso extra!",
              status: 200,
            };
          }

          if (dto.payment.billingType === "PIX") {
            try {
              const qrcode = await AsaasGetQRCodePixOfPayment({
                id: dto.payment.id,
              });
              if (socketAccount) {
                socketIo.to(socketAccount).emit("payment-plan-status", {
                  ...qrcode,
                  title: "Pedido recebido!",
                  text: `Agora é só pagar com o PIX para finalizar sua compra`,
                  status: dto.payment.status,
                  code: 1004,
                });
              }
            } catch (error) {
              if (socketAccount) {
                socketIo.to(socketAccount).emit("payment-plan-status", {
                  title: "Erro inesperado 😥",
                  text: `Ocorreu um error ao tentar solicitar ao nosso parceiro de pagamentos o QR Code da cobrança`,
                  status: dto.payment.status,
                  code: 1004,
                });
              }
              return { message: "OK!", status: 200 };
            }
            return { message: "SUCESSO!", status: 200 };
          }

          if (dto.payment.billingType === "CREDIT_CARD") {
            if (socketAccount) {
              socketIo.to(socketAccount).emit("payment-plan-status", {
                title: "Aguardando a confirmação de pagamento",
                text: `Seu plano será atualizado assim que o pagamento for confirmado`,
                status: dto.payment.status,
                code: 1002,
              });
            }
            return { message: "SUCESSO!", status: 200 };
          }
        }

        return { message: "Referencia não encontrada!", status: 200 };
      }

      if (
        dto.event === "PAYMENT_RECEIVED" ||
        dto.event === "PAYMENT_CONFIRMED"
      ) {
        console.log("COBRANÇA CONFIRMADA/RECEBIDA!");
        const { customer, externalReference } = dto.payment;

        const findAccount = await prisma.account.findFirst({
          where: { customerId: customer },
          select: {
            id: true,
            isUsedFreeTrialTime: true,
            AccountAssetsUsed: {
              select: {
                id: true,
                attendants: true,
                business: true,
                chatbots: true,
                flow: true,
                marketingSends: true,
                users: true,
              },
            },
          },
        });

        if (!findAccount) {
          console.log("conta do adm NÃO ENCONTRADA!");
          return { message: "Conta ADM não encontrada", status: 200 };
        }

        const redis = await clientRedis();
        const socketAccount = await redis.get(`socketid-${findAccount.id}`);

        if (externalReference) {
          const externalReferenceJSON: {
            periodId?: number;
            extraId?: number;
            couponId?: number;
          } = await JSON.parse(String(externalReference));

          if (externalReferenceJSON.couponId) {
            const findCoupon = await prisma.coupons.update({
              where: { id: externalReferenceJSON.couponId },
              data: { quantityUsed: { increment: 1 } },
              select: {
                Affiliates: {
                  take: 1,
                  orderBy: { id: "desc" },
                  select: {
                    id: true,
                    ContactWA: { select: { completeNumber: true } },
                  },
                },
              },
            });

            if (findCoupon?.Affiliates?.[0].id) {
              await prisma.handleAccountAffiliates.create({
                data: {
                  affiliateId: findCoupon?.Affiliates?.[0].id,
                  accountId: findAccount.id,
                },
              });
            }
            if (findCoupon) {
              if (!!findCoupon.Affiliates.length) {
                const affiliateId = findCoupon.Affiliates[0].id;
                const cacheAffiliate = cacheCountSalesAffiliates[affiliateId];
                Object.assign(cacheCountSalesAffiliates, {
                  [affiliateId]: { count: (cacheAffiliate?.count ?? 0) + 1 },
                });
              }
            }
          }

          if (externalReferenceJSON.periodId) {
            const plan = await prisma.plan.findFirst({
              where: {
                PlanPeriods: { some: { id: externalReferenceJSON.periodId } },
              },
              select: {
                id: true,
                free_trial_time: true,
                PlanAssets: {
                  select: {
                    attendants: true,
                    business: true,
                    chatbots: true,
                    connections: true,
                    contactsWA: true,
                    flow: true,
                    marketingSends: true,
                    users: true,
                  },
                },
              },
            });
            if (!plan) {
              if (socketAccount) {
                socketIo.to(socketAccount).emit("payment-plan-status", {
                  message: "Plano não encontrado",
                  text: `Já fomos notificado sobre o seu problema! Entraremos em contato com você assim que possivel`,
                  status: dto.payment.status,
                  code: 1501,
                });
              }
              return { message: "Plano não encontrado!", status: 200 };
            }
            await this.repository.updatePlanAccount({
              accountId: findAccount.id,
              planId: plan.id,
            });
            if (plan.free_trial_time) {
              await prisma.account.update({
                where: { id: findAccount.id },
                data: { isUsedFreeTrialTime: true },
              });
            }

            if (!!plan.PlanAssets.attendants) {
              const pickResources = await prisma.sectorsAttendants.findMany({
                where: {
                  accountId: findAccount.id,
                  interrupted: true,
                },
                take: plan.PlanAssets.attendants,
                select: { id: true },
              });
              if (pickResources.length) {
                await prisma.sectorsAttendants.updateMany({
                  where: { id: { in: pickResources.map((s) => s.id) } },
                  data: { interrupted: false },
                });
              }
            }
            if (!!plan.PlanAssets.business) {
              const pickResources = await prisma.business.findMany({
                where: {
                  accountId: findAccount.id,
                  interrupted: true,
                },
                take: plan.PlanAssets.business,
                select: { id: true },
              });
              if (pickResources.length) {
                await prisma.business.updateMany({
                  where: { id: { in: pickResources.map((s) => s.id) } },
                  data: { interrupted: false },
                });
              }
            }
            if (!!plan.PlanAssets.chatbots) {
              const pickResources = await prisma.chatbot.findMany({
                where: {
                  accountId: findAccount.id,
                  interrupted: true,
                },
                take: plan.PlanAssets.chatbots,
                select: { id: true },
              });
              if (pickResources.length) {
                await prisma.chatbot.updateMany({
                  where: { id: { in: pickResources.map((s) => s.id) } },
                  data: { interrupted: false },
                });
              }
            }
            if (!!plan.PlanAssets.connections) {
              const pickResources = await prisma.connectionOnBusiness.findMany({
                where: {
                  Business: {
                    accountId: findAccount.id,
                    interrupted: true,
                  },
                },
                take: plan.PlanAssets.connections,
                select: { id: true },
              });
              if (pickResources.length) {
                await prisma.connectionOnBusiness.updateMany({
                  where: { id: { in: pickResources.map((s) => s.id) } },
                  data: { interrupted: false },
                });
              }
            }
            // if (!!plan.PlanAssets.marketingSends) {
            //   const pickResources = await prisma.campaign.findMany({
            //     where: {
            //       accountId: findAccount.id,
            //       interrupted: true,
            //     },
            //     take: plan.PlanAssets.marketingSends,
            //     select: { id: true },
            //   });
            //   if (pickResources.length) {
            //     await prisma.campaign.updateMany({
            //       where: { id: { in: pickResources.map((s) => s.id) } },
            //       data: { interrupted: false },
            //     });
            //   }
            // }
            if (!!plan.PlanAssets.users) {
              const pickResources = await prisma.subAccount.findMany({
                where: {
                  accountId: findAccount.id,
                  interrupted: true,
                },
                take: plan.PlanAssets.users,
                select: { id: true },
              });
              if (pickResources.length) {
                await prisma.subAccount.updateMany({
                  where: { id: { in: pickResources.map((s) => s.id) } },
                  data: { interrupted: false },
                });
              }
            }
            // if (!!plan.PlanAssets.contactsWA) {
            //   const pickResources = await prisma.subAccount.findMany({
            //     where: {
            //       accountId: findAccount.id,
            //       interrupted: true,
            //     },
            //     take: plan.PlanAssets.users,
            //     select: { id: true },
            //   });
            //   if (pickResources.length) {
            //     await prisma.subAccount.updateMany({
            //       where: { id: { in: pickResources.map((s) => s.id) } },
            //       data: { interrupted: false },
            //     });
            //   }
            // }

            const business = await prisma.business.count({
              where: { accountId: findAccount.id },
            });

            const attendants = await prisma.sectorsAttendants.count({
              where: { accountId: findAccount.id },
            });
            const chatbots = await prisma.chatbot.count({
              where: { accountId: findAccount.id },
            });
            const connections = await prisma.connectionOnBusiness.count({
              where: { Business: { accountId: findAccount.id } },
            });
            const users = await prisma.subAccount.count({
              where: { accountId: findAccount.id },
            });
            const flow = await ModelFlows.countDocuments({
              accountId: findAccount.id,
            });

            await prisma.accountAssetsUsed.update({
              where: { id: findAccount.AccountAssetsUsed.id },
              data: {
                attendants,
                business,
                chatbots,
                users,
                flow,
                marketingSends: 0,
              },
            });

            if (socketAccount) {
              socketIo.to(socketAccount).emit("payment-plan-status", {
                message: "Pagamento confirmado com sucesso ✅",
                text: `Seu pagamento foi confirmado e já atualizamos o seu plano 🚀`,
                status: dto.payment.status,
                code: 1003,
              });
            }

            return {
              message: "Aguardando a confirmação de pagamento do plano!",
              status: 200,
            };
          }
          if (externalReference.extraId) {
            return {
              message:
                "Aguardando a confirmação de pagamento do recurso extra!",
              status: 200,
            };
          }
        }

        return { message: "Referencia não encontrada!", status: 200 };
      }

      if (dto.event === "PAYMENT_OVERDUE") {
        const assetsSubscription = await prisma.accountSubscriptions.findFirst({
          where: { subscriptionsId: dto.payment.subscription },
          select: {
            accountId: true,
            PlanPeriods: {
              select: {
                Plan: {
                  select: {
                    PlanAssets: {
                      select: {
                        attendants: true,
                        business: true,
                        chatbots: true,
                        connections: true,
                        contactsWA: true,
                        flow: true,
                        marketingSends: true,
                        users: true,
                      },
                    },
                  },
                },
              },
            },
            ExtraPackage: { select: { amount: true, type: true } },
          },
        });

        if (assetsSubscription?.PlanPeriods?.Plan) {
          const sub = assetsSubscription;
          const { PlanAssets } = assetsSubscription.PlanPeriods.Plan;
          if (!!PlanAssets.attendants) {
            const pickResources = await prisma.sectorsAttendants.findMany({
              where: { accountId: sub.accountId },
              take: PlanAssets.attendants,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.sectorsAttendants.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (!!PlanAssets.business) {
            const pickResources = await prisma.business.findMany({
              where: { accountId: sub.accountId },
              take: PlanAssets.business,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.business.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (!!PlanAssets.chatbots) {
            const pickResources = await prisma.chatbot.findMany({
              where: { accountId: sub.accountId },
              take: PlanAssets.chatbots,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.chatbot.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (!!PlanAssets.connections) {
            const pickResources = await prisma.connectionOnBusiness.findMany({
              where: { Business: { accountId: sub.accountId } },
              take: PlanAssets.connections,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.connectionOnBusiness.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (!!PlanAssets.marketingSends) {
            const pickResources = await prisma.campaign.findMany({
              where: { accountId: sub.accountId },
              take: PlanAssets.marketingSends,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.campaign.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (!!PlanAssets.users) {
            const pickResources = await prisma.subAccount.findMany({
              where: { accountId: sub.accountId },
              take: PlanAssets.users,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.subAccount.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
        }

        const sub = assetsSubscription;
        if (!!sub?.ExtraPackage) {
          if (sub.ExtraPackage.type === "attendants") {
            const pickResources = await prisma.sectorsAttendants.findMany({
              where: { accountId: sub.accountId },
              take: sub.ExtraPackage.amount,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.sectorsAttendants.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (sub.ExtraPackage.type === "business") {
            const pickResources = await prisma.business.findMany({
              where: { accountId: sub.accountId },
              take: sub.ExtraPackage.amount,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.business.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (sub.ExtraPackage.type === "chatbotConversations") {
            const pickResources = await prisma.chatbot.findMany({
              where: { accountId: sub.accountId },
              take: sub.ExtraPackage.amount,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.chatbot.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (sub.ExtraPackage.type === "connections") {
            const pickResources = await prisma.connectionOnBusiness.findMany({
              where: { Business: { accountId: sub.accountId } },
              take: sub.ExtraPackage.amount,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.connectionOnBusiness.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (sub.ExtraPackage.type === "marketingSends") {
            const pickResources = await prisma.campaign.findMany({
              where: { accountId: sub.accountId },
              take: sub.ExtraPackage.amount,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.campaign.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
          if (sub.ExtraPackage.type === "users") {
            const pickResources = await prisma.subAccount.findMany({
              where: { accountId: sub.accountId },
              take: sub.ExtraPackage.amount,
              select: { id: true },
            });
            if (pickResources.length) {
              await prisma.subAccount.updateMany({
                where: { id: { in: pickResources.map((s) => s.id) } },
                data: { interrupted: true },
              });
            }
          }
        }

        return { message: "Pagamento atrasado!", status: 200 };
      }

      if (dto.event === "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED") {
        console.log("cobrança recusada!");
        const { customer } = dto.payment;

        const findAccount = await prisma.account.findFirst({
          where: { customerId: customer },
          select: { id: true, isUsedFreeTrialTime: true },
        });

        if (!findAccount) {
          console.log("conta do adm NÃO ENCONTRADA!");
          return { message: "Conta ADM não encontrada", status: 200 };
        }

        const redis = await clientRedis();
        const socketAccount = await redis.get(`socketid-${findAccount.id}`);

        if (socketAccount) {
          socketIo.to(socketAccount).emit("payment-plan-status", {
            message: "Pagamento foi recusado ❌",
            text: `Pagamento foi recusado ❌`,
            status: "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
          });
        }
      }

      return { message: "OK!", status: 200 };

      // const subscriptionsId = dto.payment.externalReference;

      // const account = await prisma.account.findFirst({
      //   where: { customerId: dto.payment.customer },
      //   select: { id: true, isUsedFreeTrialTime: true },
      // });

      // if (!account) {
      //   try {
      //     await updateAsaasSubscription(subscriptionsId, {
      //       status: "INACTIVE",
      //     });
      //   } catch (error) {
      //     console.log("Error para atualizar a assinatura");
      //   }
      //   return { message: "Conta não encontrada", status: 200 };
      // }

      // const fetchSubscription = await prisma.accountSubscriptions.findFirst({
      //   where: { id: Number(subscriptionsId) },
      //   select: {
      //     deleted: true,
      //     dateOfCancellation: true,
      //     type: true,
      //     id: true,
      //     planPeriodsId: true,
      //     extraPackageId: true,
      //     Coupon: {
      //       select: {
      //         id: true,
      //         Affiliates: {
      //           take: 1,
      //           orderBy: { id: "desc" },
      //           select: {
      //             id: true,
      //             ContactWA: { select: { completeNumber: true } },
      //           },
      //         },
      //       },
      //     },
      //   },
      // });

      // if (!fetchSubscription || fetchSubscription?.deleted) {
      //   try {
      //     await updateAsaasSubscription(dto.payment.subscription, {
      //       status: "INACTIVE",
      //     });
      //   } catch (error) {
      //     console.log("Não foi possivel atualizar a assinatura");
      //   }
      //   return { message: "Sucesso!", status: 200 };
      // }

      // const redis = await clientRedis();
      // const socketAccount = await redis.get(`socketid-${account.id}`);

      // if (fetchSubscription.type === "PLAN") {
      //   if (dto.event === "PAYMENT_CREATED") {
      //     const plan = await prisma.plan.findFirst({
      //       where: {
      //         PlanPeriods: { some: { id: fetchSubscription.planPeriodsId! } },
      //       },
      //       select: { free_trial_time: true },
      //     });
      //     if (!plan) {
      //       if (socketAccount) {
      //         socketIo.to(socketAccount).emit("payment-plan-status", {
      //           message: "Plano não encontrado",
      //           text: `Já fomos notificado sobre o seu problema! Entraremos em contato com você assim que possivel`,
      //           status: dto.payment.status,
      //           code: 1501,
      //         });
      //       }
      //       return { message: "Plano não encontrado", status: 200 };
      //     }

      //     if (!account.isUsedFreeTrialTime && !!plan.free_trial_time) {
      //       this.repository.updatePlanAccount({
      //         accountId: account.id,
      //         planId: fetchSubscription.planPeriodsId!,
      //       });
      //       prisma.account.update({
      //         where: { id: account.id },
      //         data: { isUsedFreeTrialTime: true },
      //       });

      //       if (socketAccount) {
      //         socketIo.to(socketAccount).emit("payment-plan-status", {
      //           title: "Assinatura efetuada com sucesso 🥳.",
      //           text: `Você tem ${plan.free_trial_time} dias gratis para testar o plano`,
      //           billingDate: moment(dto.payment.dueDate, "YYYY-MM-DD").format(
      //             "DD/MM/YYYY"
      //           ),
      //           status: dto.payment.status,
      //           code: 1001,
      //         });
      //       }
      //       return { message: "SUCESSO!" };
      //     }

      //     if (dto.payment.billingType === "PIX") {
      //       try {
      //         const qrcode = await AsaasGetQRCodePixOfPayment({
      //           id: dto.payment.id,
      //         });
      //         if (socketAccount) {
      //           socketIo.to(socketAccount).emit("payment-plan-status", {
      //             ...qrcode,
      //             title: "Seu QR Code foi gerado com sucesso",
      //             text: `Seu plano será atualizado assim que o pagamento for confirmado`,
      //             status: dto.payment.status,
      //             code: 1004,
      //           });
      //         }
      //       } catch (error) {
      //         if (socketAccount) {
      //           socketIo.to(socketAccount).emit("payment-plan-status", {
      //             title: "Erro inesperado 😥",
      //             text: `Ocorreu um error ao tentar solicitar ao nosso parceiro de pagamentos o QR Code da cobrança`,
      //             status: dto.payment.status,
      //             code: 1004,
      //           });
      //         }
      //         return { message: "OK!", status: 200 };
      //       }
      //       return { message: "SUCESSO!", status: 200 };
      //     }

      //     if (socketAccount) {
      //       socketIo.to(socketAccount).emit("payment-plan-status", {
      //         title: "Aguardando a confirmação de pagamento",
      //         text: `Seu plano será atualizado assim que o pagamento for confirmado`,
      //         status: dto.payment.status,
      //         code: 1002,
      //       });
      //     }

      //     return { message: "SUCESSO!", status: 200 };
      //   }

      //   if (
      //     dto.event === "PAYMENT_RECEIVED" ||
      //     dto.event === "PAYMENT_CONFIRMED"
      //   ) {
      //     // desativa as outras assinatura ativas;
      //     // essa operação chama-se UPGRADE ou DOWNGRADE
      //     console.log("DESATIVANDO PLANOS!!");
      //     const subscriptionsCustomer = await getAsaasSubscriptions({
      //       status: "ACTIVE",
      //       customer: dto.payment.customer,
      //     });
      //     // busca todas as assinaturas do cliente ativas
      //     console.log("====== assinaturas encontradas lá no asaas ======");
      //     console.log(subscriptionsCustomer.length);

      //     // vai desativar apenas assinatura de planos e não recursos extras

      //     const newListSubs: ResultGetSubscriptions[] = [];

      //     for await (const s of subscriptionsCustomer) {
      //       const isSubPlan = !!(await prisma.accountSubscriptions.findFirst({
      //         where: {
      //           subscriptionsId: s.id,
      //           type: "PLAN",
      //           accountId: account.id,
      //         },
      //         select: { id: true },
      //       }));
      //       const isOutherSub = s.id !== dto.payment.subscription;
      //       console.log({
      //         subId: s.id,
      //         dtoSubs: dto.payment.subscription,
      //         isSubPlan,
      //         isOutherSub,
      //         result: isSubPlan && isOutherSub,
      //       });
      //       if (isSubPlan && isOutherSub) newListSubs.push(s);
      //     }

      //     console.log({ newListSubs });
      //     newListSubs.forEach((sub) => {
      //       updateAsaasSubscription(sub.id, { status: "INACTIVE" }).catch(
      //         () => {
      //           console.log("Não foi possivel atualiza a assiantura");
      //         }
      //       );
      //     });
      //     console.log("passou aqui");

      //     this.repository.updatePlanAccount({
      //       accountId: account.id,
      //       planId: fetchSubscription.planPeriodsId!,
      //     });
      //     if (fetchSubscription.Coupon?.id) {
      //       prisma.coupons.update({
      //         where: { id: fetchSubscription.Coupon.id },
      //         data: { quantityUsed: { increment: 1 } },
      //       });
      //     }

      //     if (fetchSubscription.Coupon?.Affiliates?.[0].id) {
      //       await prisma.handleAccountAffiliates.create({
      //         data: {
      //           affiliateId: fetchSubscription.Coupon?.Affiliates?.[0].id,
      //           accountId: account.id,
      //         },
      //       });
      //     }

      //     if (fetchSubscription.Coupon) {
      //       if (!!fetchSubscription.Coupon.Affiliates.length) {
      //         const affiliateId = fetchSubscription.Coupon.Affiliates[0].id;
      //         const cacheAffiliate = cacheCountSalesAffiliates[affiliateId];
      //         Object.assign(cacheCountSalesAffiliates, {
      //           [affiliateId]: { count: (cacheAffiliate?.count ?? 0) + 1 },
      //         });
      //       }
      //     }

      //     if (socketAccount) {
      //       socketIo.to(socketAccount).emit("payment-plan-status", {
      //         message: "Pagamento confirmado com sucesso ✅",
      //         text: `Seu pagamento foi confirmado e já atualizamos o seu plano 🚀`,
      //         status: dto.payment.status,
      //         code: 1003,
      //       });
      //     }

      //     const assetsSubscription =
      //       await prisma.accountSubscriptions.findFirst({
      //         where: { subscriptionsId: dto.payment.subscription },
      //         select: {
      //           accountId: true,
      //           PlanPeriods: {
      //             select: {
      //               Plan: {
      //                 select: {
      //                   id: true,
      //                   PlanAssets: {
      //                     select: {
      //                       attendants: true,
      //                       business: true,
      //                       chatbots: true,
      //                       connections: true,
      //                       contactsWA: true,
      //                       flow: true,
      //                       marketingSends: true,
      //                       users: true,
      //                     },
      //                   },
      //                 },
      //               },
      //             },
      //           },
      //           ExtraPackage: { select: { amount: true, type: true } },
      //         },
      //       });

      //     if (assetsSubscription?.PlanPeriods?.Plan) {
      //       const { PlanAssets } = assetsSubscription.PlanPeriods.Plan;
      //       if (!!PlanAssets.attendants) {
      //         const pickResources = await prisma.sectorsAttendants.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: PlanAssets.attendants,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.sectorsAttendants.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (!!PlanAssets.business) {
      //         const pickResources = await prisma.business.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: PlanAssets.business,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.business.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (!!PlanAssets.chatbots) {
      //         const pickResources = await prisma.chatbot.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: PlanAssets.chatbots,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.chatbot.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (!!PlanAssets.connections) {
      //         const pickResources = await prisma.connectionOnBusiness.findMany({
      //           where: {
      //             Business: {
      //               accountId: assetsSubscription.accountId,
      //               interrupted: true,
      //             },
      //           },
      //           take: PlanAssets.connections,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.connectionOnBusiness.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (!!PlanAssets.marketingSends) {
      //         const pickResources = await prisma.campaign.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: PlanAssets.marketingSends,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.campaign.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (!!PlanAssets.users) {
      //         const pickResources = await prisma.subAccount.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: PlanAssets.users,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.subAccount.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //     }
      //   }
      // }

      // if (fetchSubscription.type === "EXTRA") {
      //   if (dto.event === "PAYMENT_CREATED") {
      //     if (dto.payment.billingType === "PIX") {
      //       try {
      //         const qrcode = await AsaasGetQRCodePixOfPayment({
      //           id: dto.payment.id,
      //         });
      //         if (socketAccount) {
      //           socketIo.to(socketAccount).emit("payment-plan-status", {
      //             ...qrcode,
      //             title: "Seu QR Code foi gerado com sucesso",
      //             text: `Seu pacote extra será atualizado assim que o pagamento for confirmado`,
      //             status: dto.payment.status,
      //             code: 1004,
      //           });
      //         }
      //       } catch (error) {
      //         if (socketAccount) {
      //           socketIo.to(socketAccount).emit("payment-plan-status", {
      //             title: "Erro inesperado 😥",
      //             text: `Ocorreu um error ao tentar solicitar ao nosso parceiro de pagamentos o QR Code da cobrança`,
      //             status: dto.payment.status,
      //             code: 1004,
      //           });
      //         }
      //         return { message: "OK!", status: 200 };
      //       }
      //       return { message: "SUCESSO!", status: 200 };
      //     }

      //     if (socketAccount) {
      //       socketIo.to(socketAccount).emit("payment-plan-status", {
      //         title: "Aguardando a confirmação de pagamento",
      //         text: `Seu pacote extra será atualizado assim que o pagamento for confirmado`,
      //         status: dto.payment.status,
      //         code: 1002,
      //       });
      //     }

      //     return { message: "SUCESSO!", status: 200 };
      //   }

      //   if (
      //     dto.event === "PAYMENT_RECEIVED" ||
      //     dto.event === "PAYMENT_CONFIRMED"
      //   ) {
      //     const extra = await prisma.extraPackages.findFirst({
      //       where: { id: fetchSubscription.extraPackageId! },
      //     });
      //     if (!extra) {
      //       if (socketAccount) {
      //         socketIo.to(socketAccount).emit("payment-plan-status", {
      //           message: "Pacote extra não encontrado",
      //           text: `Já fomos notificado sobre o seu problema! Entraremos em contato com você assim que possivel`,
      //           status: dto.payment.status,
      //           code: 1501,
      //         });
      //       }
      //       return { message: "Pacote extra não encontrado", status: 200 };
      //     }

      //     await prisma.extraPackageOnAccount.create({
      //       data: {
      //         accountId: account.id,
      //         extraId: fetchSubscription.extraPackageId!,
      //       },
      //     });

      //     if (fetchSubscription.Coupon?.id) {
      //       prisma.coupons.update({
      //         where: { id: fetchSubscription.Coupon.id },
      //         data: { quantityUsed: { increment: 1 } },
      //       });
      //     }

      //     if (fetchSubscription.Coupon?.Affiliates?.[0].id) {
      //       await prisma.handleAccountAffiliates.create({
      //         data: {
      //           affiliateId: fetchSubscription.Coupon?.Affiliates?.[0].id,
      //           accountId: account.id,
      //         },
      //       });
      //     }

      //     if (fetchSubscription.Coupon) {
      //       if (!!fetchSubscription.Coupon.Affiliates.length) {
      //         const affiliateId = fetchSubscription.Coupon.Affiliates[0].id;
      //         const cacheAffiliate = cacheCountSalesAffiliates[affiliateId];
      //         Object.assign(cacheCountSalesAffiliates, {
      //           [affiliateId]: { count: (cacheAffiliate?.count ?? 0) + 1 },
      //         });
      //       }
      //     }

      //     if (socketAccount) {
      //       socketIo.to(socketAccount).emit("payment-plan-status", {
      //         message: "Pagamento confirmado com sucesso ✅",
      //         text: `Seu pagamento foi confirmado e já atualizamos o seu pacote extra 🚀`,
      //         status: dto.payment.status,
      //         code: 1003,
      //       });
      //     }

      //     const assetsSubscription =
      //       await prisma.accountSubscriptions.findFirst({
      //         where: { subscriptionsId: dto.payment.subscription },
      //         select: {
      //           accountId: true,
      //           PlanPeriods: {
      //             select: {
      //               Plan: {
      //                 select: {
      //                   id: true,
      //                   PlanAssets: {
      //                     select: {
      //                       attendants: true,
      //                       business: true,
      //                       chatbots: true,
      //                       connections: true,
      //                       contactsWA: true,
      //                       flow: true,
      //                       marketingSends: true,
      //                       users: true,
      //                     },
      //                   },
      //                 },
      //               },
      //             },
      //           },
      //           ExtraPackage: { select: { amount: true, type: true } },
      //         },
      //       });

      //     if (!!assetsSubscription?.ExtraPackage) {
      //       if (assetsSubscription.ExtraPackage.type === "attendants") {
      //         const pickResources = await prisma.sectorsAttendants.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: assetsSubscription.ExtraPackage.amount,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.sectorsAttendants.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (assetsSubscription.ExtraPackage.type === "business") {
      //         const pickResources = await prisma.business.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: assetsSubscription.ExtraPackage.amount,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.business.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (
      //         assetsSubscription.ExtraPackage.type === "chatbotConversations"
      //       ) {
      //         const pickResources = await prisma.chatbot.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: assetsSubscription.ExtraPackage.amount,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.chatbot.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (assetsSubscription.ExtraPackage.type === "connections") {
      //         const pickResources = await prisma.connectionOnBusiness.findMany({
      //           where: {
      //             Business: { accountId: assetsSubscription.accountId },
      //             interrupted: true,
      //           },
      //           take: assetsSubscription.ExtraPackage.amount,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.connectionOnBusiness.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (assetsSubscription.ExtraPackage.type === "marketingSends") {
      //         const pickResources = await prisma.campaign.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: assetsSubscription.ExtraPackage.amount,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.campaign.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //       if (assetsSubscription.ExtraPackage.type === "users") {
      //         const pickResources = await prisma.subAccount.findMany({
      //           where: {
      //             accountId: assetsSubscription.accountId,
      //             interrupted: true,
      //           },
      //           take: assetsSubscription.ExtraPackage.amount,
      //           select: { id: true },
      //         });
      //         if (pickResources.length) {
      //           await prisma.subAccount.updateMany({
      //             where: { id: { in: pickResources.map((s) => s.id) } },
      //             data: { interrupted: false },
      //           });
      //         }
      //       }
      //     }
      //   }
      // }

      // if (dto.event === "PAYMENT_OVERDUE") {
      //   const assetsSubscription = await prisma.accountSubscriptions.findFirst({
      //     where: { subscriptionsId: dto.payment.subscription },
      //     select: {
      //       accountId: true,
      //       PlanPeriods: {
      //         select: {
      //           Plan: {
      //             select: {
      //               PlanAssets: {
      //                 select: {
      //                   attendants: true,
      //                   business: true,
      //                   chatbots: true,
      //                   connections: true,
      //                   contactsWA: true,
      //                   flow: true,
      //                   marketingSends: true,
      //                   users: true,
      //                 },
      //               },
      //             },
      //           },
      //         },
      //       },
      //       ExtraPackage: { select: { amount: true, type: true } },
      //     },
      //   });

      //   if (assetsSubscription?.PlanPeriods?.Plan) {
      //     const sub = assetsSubscription;
      //     const { PlanAssets } = assetsSubscription.PlanPeriods.Plan;
      //     if (!!PlanAssets.attendants) {
      //       const pickResources = await prisma.sectorsAttendants.findMany({
      //         where: { accountId: sub.accountId },
      //         take: PlanAssets.attendants,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.sectorsAttendants.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (!!PlanAssets.business) {
      //       const pickResources = await prisma.business.findMany({
      //         where: { accountId: sub.accountId },
      //         take: PlanAssets.business,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.business.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (!!PlanAssets.chatbots) {
      //       const pickResources = await prisma.chatbot.findMany({
      //         where: { accountId: sub.accountId },
      //         take: PlanAssets.chatbots,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.chatbot.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (!!PlanAssets.connections) {
      //       const pickResources = await prisma.connectionOnBusiness.findMany({
      //         where: { Business: { accountId: sub.accountId } },
      //         take: PlanAssets.connections,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.connectionOnBusiness.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (!!PlanAssets.marketingSends) {
      //       const pickResources = await prisma.campaign.findMany({
      //         where: { accountId: sub.accountId },
      //         take: PlanAssets.marketingSends,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.campaign.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (!!PlanAssets.users) {
      //       const pickResources = await prisma.subAccount.findMany({
      //         where: { accountId: sub.accountId },
      //         take: PlanAssets.users,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.subAccount.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //   }

      //   const sub = assetsSubscription;
      //   if (!!sub?.ExtraPackage) {
      //     if (sub.ExtraPackage.type === "attendants") {
      //       const pickResources = await prisma.sectorsAttendants.findMany({
      //         where: { accountId: sub.accountId },
      //         take: sub.ExtraPackage.amount,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.sectorsAttendants.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (sub.ExtraPackage.type === "business") {
      //       const pickResources = await prisma.business.findMany({
      //         where: { accountId: sub.accountId },
      //         take: sub.ExtraPackage.amount,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.business.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (sub.ExtraPackage.type === "chatbotConversations") {
      //       const pickResources = await prisma.chatbot.findMany({
      //         where: { accountId: sub.accountId },
      //         take: sub.ExtraPackage.amount,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.chatbot.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (sub.ExtraPackage.type === "connections") {
      //       const pickResources = await prisma.connectionOnBusiness.findMany({
      //         where: { Business: { accountId: sub.accountId } },
      //         take: sub.ExtraPackage.amount,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.connectionOnBusiness.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (sub.ExtraPackage.type === "marketingSends") {
      //       const pickResources = await prisma.campaign.findMany({
      //         where: { accountId: sub.accountId },
      //         take: sub.ExtraPackage.amount,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.campaign.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //     if (sub.ExtraPackage.type === "users") {
      //       const pickResources = await prisma.subAccount.findMany({
      //         where: { accountId: sub.accountId },
      //         take: sub.ExtraPackage.amount,
      //         select: { id: true },
      //       });
      //       if (pickResources.length) {
      //         await prisma.subAccount.updateMany({
      //           where: { id: { in: pickResources.map((s) => s.id) } },
      //           data: { interrupted: true },
      //         });
      //       }
      //     }
      //   }
      //   console.log("Pagamento atrasado!");
      // }

      return { message: "OK!", status: 200 };
    } catch (error) {
      console.log("Error no servidor");
      console.error(error);
      return { message: "Error no servidor!", status: 200 };
    }
  }
}

// responsavel por notificar o afiliado pelo whatsapp das vendas realizadas
setTimeout(async () => {
  const connWA = await prisma.rootConnectionWA.findMany({
    select: { connectionId: true },
  });

  const connectionON = connWA.find((c) => {
    if (c.connectionId) {
      return sessionsBaileysWA
        .get(c.connectionId)
        ?.ev.emit("connection.update", { connection: "open" });
    }
  });

  if (connectionON) {
    if (connectionON.connectionId) {
      const botWA = sessionsBaileysWA.get(connectionON.connectionId);

      for await (const [id, { count }] of Object.entries(
        cacheCountSalesAffiliates
      )) {
        if (count) {
          const affiliate = await prisma.affiliates.findFirst({
            where: { id: Number(id) },
            select: { ContactWA: { select: { completeNumber: true } } },
          });

          if (affiliate?.ContactWA.completeNumber) {
            await botWA
              ?.sendMessage(
                affiliate.ContactWA.completeNumber + "@s.whatsapp.net",
                {
                  text:
                    count > 1
                      ? `${count} **Vendas realizadas!**`
                      : `${count} **Venda realizada!**`,
                }
              )
              .catch((err) => console.log(err));
          }
        }
      }
    }
  }
}, 6 * 60 * 60 * 1000);
