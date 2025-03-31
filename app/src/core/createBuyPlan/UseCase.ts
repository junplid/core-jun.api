import moment from "moment-timezone";
import {
  createAsaasSubscriptions,
  deleteAsaasSubscription,
  updateAsaasSubscription,
} from "../../services/Assas/Subscriptions";
import { CreateBuyPlanDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ApplicableTo, TypeCyclePlanPeriods } from "@prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateBuyPlanUseCase {
  constructor() {}

  async run(dto: CreateBuyPlanDTO_I) {
    try {
      const plan = await prisma.plan.findFirst({
        where: { id: dto.planId, acceptsNewUsers: true, allowsRenewal: true },
        select: {
          name: true,
          free_trial_time: true,
          type: true,
          PlanAssets: true,
          description: true,
        },
      });

      if (!plan) {
        throw new ErrorResponse(400).toast({
          title: "Plano não encontrado ou não mais disponível",
          type: "error",
        });
      }

      let periodPlan: {
        cycle: TypeCyclePlanPeriods;
        price: Decimal;
      } | null = null;

      if (plan.type === "paid") {
        periodPlan = await prisma.planPeriods.findFirst({
          where: { id: dto.periodId },
          select: { cycle: true, price: true },
        });

        if (!periodPlan) {
          throw new ErrorResponse(400).toast({
            title:
              "Error ao processar pagamento. Periodo do plano não encontrado",

            type: "error",
          });
        }
      }
      let walletId: string | null = null;
      let couponId: number | null = null;
      let fixedValue: number | null = null;
      let percentualValue: number | null = null;

      if (dto.coupon) {
        const coupon = await prisma.coupons.findFirst({
          where: { activationCode: dto.coupon },
          select: {
            applicableTo: true,
            discountType: true,
            discountValue: true,
            id: true,
            status: true,
            Affiliates: {
              select: {
                id: true,
                walletId: true,
                commissionType: true,
                commissionValue: true,
              },
            },
            validFrom: true,
            validUntil: true,
            quantityUsed: true,
            maxQuantity: true,
          },
        });

        if (!coupon) throw { message: "Cupom inválido", statusCode: 400 };

        if (!coupon.applicableTo) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom invalido",
          });
        }

        const applicableTo: ApplicableTo[] = JSON.parse(coupon.applicableTo);
        if (!applicableTo.includes("PLANS")) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom não é válido para planos",
          });
        }

        if (!coupon.status) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom desativado",
          });
        }

        if (coupon.validFrom && coupon.validUntil) {
          const now = new Date();
          if (now < coupon.validFrom || now > coupon.validUntil) {
            throw new ErrorResponse(400).input({
              path: "coupon",
              text: "Cupom fora do período de validade",
            });
          }
        }

        if (coupon.validFrom && !coupon.validUntil) {
          const now = new Date();
          if (now < coupon.validFrom) {
            throw new ErrorResponse(400).input({
              path: "coupon",
              text: "Cupom fora do período de validade",
            });
          }
        }

        if (coupon.validUntil && !coupon.validFrom) {
          const now = new Date();
          if (now > coupon.validUntil) {
            throw new ErrorResponse(400).input({
              path: "coupon",
              text: "Cupom fora do período de validade",
            });
          }
        }

        if (coupon.maxQuantity && coupon.quantityUsed >= coupon.maxQuantity) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom atingiu o limite máximo de uso",
          });
        }

        if (periodPlan) {
          if (coupon.discountType === "PERCENTAGE") {
            periodPlan.price = periodPlan.price.minus(
              periodPlan.price.times(coupon.discountValue / 100)
            );
          } else if (coupon.discountType === "REAL") {
            periodPlan.price = periodPlan.price.minus(coupon.discountValue);
          }

          if (periodPlan.price.lessThan(0)) periodPlan.price = new Decimal(0);
          if (!!coupon.Affiliates.length) {
            if (coupon.Affiliates[0].commissionType === "PERCENTAGE") {
              percentualValue = coupon.Affiliates?.[0].commissionValue;
            } else if (coupon.Affiliates?.[0].commissionType === "REAL") {
              fixedValue = coupon.Affiliates?.[0].commissionValue;
            }
          }
        }

        couponId = coupon.id;
        if (coupon.Affiliates.length) {
          walletId = coupon.Affiliates[0].walletId;
        }
      }

      if (plan.type === "paid") {
        const account = await prisma.account.findFirst({
          where: { id: dto.accountId },
          select: {
            isUsedFreeTrialTime: true,
            customerId: true,
            AccountSubscriptions: {
              where: { type: "PLAN", deleted: false },
              take: 1,
              orderBy: { id: "desc" },
              select: {
                subscriptionsId: true,
                creditCardId: true,
                billingType: true,
              },
            },
          },
        });

        if (!account) {
          throw new ErrorResponse(400).toast({
            title: "Conta não encontrada ou não está autorizada",
            type: "error",
          });
        }

        if (!periodPlan) {
          throw new ErrorResponse(400).toast({
            title: "Error. Periodo do plano não encontrado",
            type: "error",
          });
        }

        const nextDueDate = moment()
          .add(
            (!account.isUsedFreeTrialTime && plan.free_trial_time) || 0,
            "days"
          )
          .format("YYYY-MM-DD");

        if (!account.customerId) {
          throw new ErrorResponse(400).toast({
            title:
              "Para criar qualquer transação é nescessario os dados de `NOME COMPLETO` e `CPF`",

            type: "error",
          });
        }

        let creditCardToken: null | string = null;

        if (dto.billingType === "CREDIT_CARD") {
          const creditCard = await prisma.creditCardsOnAccount.findFirst({
            where: { id: dto.creditCardId },
            select: { token: true },
          });
          if (!creditCard?.token) {
            throw new ErrorResponse(400).toast({
              title:
                "Error ao processar a cobrança. token de segurança do cartão não encontrado",

              type: "error",
            });
          }
          creditCardToken = creditCard?.token;
        }
        let id: null | string = null;

        try {
          if (account.AccountSubscriptions.length) {
            await updateAsaasSubscription(
              account.AccountSubscriptions[0].subscriptionsId,
              { status: "INACTIVE" }
            );
          }
          // @ts-expect-error
          const subs = await createAsaasSubscriptions({
            customer: account.customerId,
            cycle: periodPlan.cycle,
            nextDueDate,
            value: Number(periodPlan.price),
            description: plan.description,
            externalReference: JSON.stringify({ periodId: dto.periodId }),
            ...(walletId && {
              split: [{ walletId, fixedValue, percentualValue }],
            }),
            billingType: "PIX",
            ...(dto.billingType === "CREDIT_CARD" && {
              creditCardToken,
              remoteIp: dto.remoteIp,
              billingType: "CREDIT_CARD",
            }),
          });
          id = subs.id;
        } catch (error) {
          throw new ErrorResponse(400).toast({
            title: "Error, Não foi possivel gerar a cobrança",
            type: "error",
          });
        }
      } else {
        await prisma.account.update({
          where: { id: dto.accountId },
          data: { planId: dto.planId },
        });
      }

      return {
        message: "OK!",
        status: 201,
        value: Number(periodPlan?.price),
        cycle: periodPlan?.cycle,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Error, Não foi possivel gerar a cobrança",
        type: "error",
      });
    }
  }
}
