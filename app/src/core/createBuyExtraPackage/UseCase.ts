import moment from "moment-timezone";
import { createAsaasSubscriptions } from "../../services/Assas/Subscriptions";
import { CreateBuyExtraPackageDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ApplicableTo } from "@prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateBuyExtraPackageUseCase {
  constructor() {}

  async run(dto: CreateBuyExtraPackageDTO_I) {
    try {
      const account = await prisma.account.findFirst({
        where: { id: dto.accountId },
        select: { customerId: true, planId: true },
      });

      if (!account || !account.planId) {
        throw new ErrorResponse(400).toast({
          title: "Conta não encontrada ou não está autorizada",
          type: "error",
        });
      }

      if (!account.customerId) {
        throw new ErrorResponse(400).toast({
          title:
            "Para criar qualquer transação é nescessario os dados de `NOME COMPLETO` e `CPF`",
          type: "error",
        });
      }

      const extra = await prisma.extraPackages.findFirst({
        where: { id: dto.extraPackageId, status: true, newSubscribers: true },
        select: {
          name: true,
          cycle: true,
          price: true,
          periodValidityStart: true,
          periodValidityEnd: true,
          allPlans: true,
          ExtraPackageOnPlans: {
            where: { planId: account.planId },
            select: { id: true },
          },
        },
      });

      if (!extra) {
        throw new ErrorResponse(400).toast({
          title: "Recurso extra não foi encontrado",
          type: "error",
        });
      }

      if (!extra.allPlans && !extra.ExtraPackageOnPlans?.length) {
        throw new ErrorResponse(400).toast({
          title: "Recurso Extra indisponivel para o seu plano",
          type: "error",
        });
      }

      if (extra.periodValidityStart && extra.periodValidityEnd) {
        const now = new Date();
        if (now < extra.periodValidityStart || now > extra.periodValidityEnd) {
          throw new ErrorResponse(400).toast({
            title: "Recurso Extra fora do período de validade",
            type: "error",
          });
        }
      }

      if (extra.periodValidityStart && !extra.periodValidityEnd) {
        const now = new Date();
        if (now < extra.periodValidityStart) {
          throw new ErrorResponse(400).toast({
            title: "Recurso Extra fora do período de validade",
            type: "error",
          });
        }
      }

      if (extra.periodValidityEnd && !extra.periodValidityStart) {
        const now = new Date();
        if (now > extra.periodValidityEnd) {
          throw new ErrorResponse(400).toast({
            title: "Recurso Extra fora do período de validade",
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

        if (!coupon) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom inválido",
          });
        }

        if (!coupon.applicableTo) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom inválido",
          });
        }

        const applicableTo: ApplicableTo[] = JSON.parse(coupon.applicableTo);
        if (!applicableTo.includes("EXTRAS")) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom não é válido para recursos extras",
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

        if (coupon.quantityUsed >= coupon.maxQuantity) {
          throw new ErrorResponse(400).input({
            path: "coupon",
            text: "Cupom atingiu o limite máximo de uso",
          });
        }

        if (extra.price) {
          if (coupon.discountType === "PERCENTAGE") {
            extra.price = extra.price.minus(
              extra.price.times(coupon.discountValue / 100)
            );
          } else if (coupon.discountType === "REAL") {
            extra.price = extra.price.minus(coupon.discountValue);
          }

          if (extra.price.lessThan(0)) extra.price = new Decimal(0);
          if (coupon.Affiliates?.[0].commissionType === "PERCENTAGE") {
            percentualValue = coupon.Affiliates?.[0].commissionValue;
          } else if (coupon.Affiliates?.[0].commissionType === "REAL") {
            fixedValue = coupon.Affiliates?.[0].commissionValue;
          }
        }

        couponId = coupon.id;
        walletId = coupon.Affiliates?.[0].walletId;
      }

      let creditCardToken: null | string = null;

      if (dto.billingType === "CREDIT_CARD") {
        const creditCard = await prisma.creditCardsOnAccount.findFirst({
          where: { id: dto.creditCardId },
          select: { token: true },
        });
        if (!creditCard?.token) {
          throw new ErrorResponse(400).toast({
            title: "Token de segurança do cartão não encontrado",
            type: "error",
          });
        }
        creditCardToken = creditCard?.token;
      }

      const subscription = await prisma.accountSubscriptions.create({
        data: {
          billingType: dto.billingType,
          subscriptionsId: "",
          type: "EXTRA",
          accountId: dto.accountId,
          couponId: couponId,
          extraPackageId: dto.extraPackageId,
        },
        select: { id: true },
      });

      let id: null | string = null;

      try {
        // @ts-expect-error
        const subs = await createAsaasSubscriptions({
          customer: account.customerId,
          cycle: extra.cycle,
          nextDueDate: moment().format("YYYY-MM-DD"),
          value: Number(extra.price),
          externalReference: String(subscription.id),
          ...(walletId &&
            fixedValue &&
            percentualValue && {
              split: [{ walletId, fixedValue, percentualValue }],
            }),
          billingType: dto.billingType,
          ...(dto.billingType === "CREDIT_CARD" && {
            creditCardToken,
            remoteIp: dto.remoteIp,
          }),
        });
        id = subs.id;
      } catch (error) {
        throw new ErrorResponse(400).toast({
          title: "Error, Não foi possivel gerar a cobrança",
          type: "error",
        });
      }

      if (id) {
        await prisma.accountSubscriptions.update({
          where: { id: subscription.id },
          data: { subscriptionsId: id },
        });
      }

      return { message: "OK!", status: 201 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Error, Não foi possivel gerar a cobrança",
        type: "error",
      });
    }
  }
}
