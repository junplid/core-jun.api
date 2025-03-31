import { PlanAssets } from "@prisma/client";
import { GetPlanDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ErrorResponse } from "../../utils/ErrorResponse";

type ObjectLabelAssets = {
  [K in keyof Omit<PlanAssets, "id">]: string;
};

const objectLabelAssets: ObjectLabelAssets = {
  connections: "QNT de conexões",
  flow: "QNT de fluxogramas",
  chatbots: "QNT de Chatbots",
  marketingSends: "QNT disparos de marketing",
  attendants: "QNT de atendentes",
  business: "QNT negocios",
  contactsWA: "QNT contatos",
  nodeAction: "Ação",
  nodeCheckPoint: "Checkpoint",
  nodeDistributeFlow: "Distribuir fluxo",
  nodeEmailSending: "Envio de E-mail",
  nodeInitial: "Inicial",
  nodeInsertLeaderInAudience: "Inserir Lead em público",
  nodeInterruption: "Interrupção",
  nodeInterruptionLinkTackingPixel: "Reação do link de rastreio",
  nodeLinkTackingPixel: "Link de rastreio",
  nodeLogicalConditionData: "Condição logica",
  nodeMathematicalOperators: "Operador matematico",
  nodeMenu: "Menu",
  nodeMessage: "Envio de mensagem",
  nodeNewCardTrello: "Novo card no trello",
  nodeNotifyNumber: "Notificar whatsaap",
  nodeReply: "De resposta",
  nodeSendAudio: "Envio de audio",
  nodeSendContactData: "Enviar contato",
  nodeSendFile: "Enviar arquivo",
  nodeSendHumanService: "Enviar para o atendimento humano",
  nodeSendImage: "Envio de imagem",
  nodeSendLink: "Enviar link",
  nodeSendLocationGPS: "Enviar localização de GPS",
  nodeSendPdf: "Enviar PDF",
  nodeSendVideo: "Enviar video",
  nodeSwitch: "Switch",
  nodeTime: "De tempo",
  nodeWebform: "Webform",
  nodeWebhook: "Webhook",
  users: "QNT usuarios",
} as ObjectLabelAssets;

export class GetPlanUseCase {
  constructor() {}

  async run(dto: GetPlanDTO_I) {
    let affiliateId: number | null = null;
    let isUsedFreeTrialTime: boolean = false;

    if (dto.accountId) {
      const affiliate = await prisma.account.findFirst({
        where: { id: dto.accountId },
        select: {
          isUsedFreeTrialTime: true,
          HandleAccountAffiliates: {
            take: 1,
            where: { Affiliate: { status: true } },
            orderBy: { createAt: "desc" },
            select: { affiliateId: true },
          },
        },
      });
      isUsedFreeTrialTime = !!affiliate?.isUsedFreeTrialTime;
      affiliateId = affiliate?.HandleAccountAffiliates[0]?.affiliateId || 0;
    }

    if (dto.affiliate) {
      const affiliate = await prisma.affiliates.findFirst({
        where: { reference: dto.affiliate },
        select: { id: true },
      });
      affiliateId = affiliate?.id || null;
    }

    const plan = await prisma.plan.findUnique({
      where: { id: dto.id, acceptsNewUsers: true },
      select: {
        name: true,
        description: true,
        label: true,
        type: true,
        free_trial_time: true,
        ApplicableCoupons: {
          orderBy: { id: "asc" },
          where: {
            type: "PLANS",
            Coupon: {
              status: true,
              Affiliates: {
                some: {
                  id: affiliateId || 0,
                  HandleAccountAffiliates: {
                    some: { accountId: dto.accountId },
                  },
                },
              },
            },
          },
          select: {
            Coupon: {
              select: {
                discountType: true,
                discountValue: true,
                validFrom: true,
                validUntil: true,
                maxQuantity: true,
                quantityUsed: true,
              },
            },
          },
        },
        PlanAssets: {
          select: {
            attendants: true,
            business: true,
            chatbots: true,
            connections: true,
            contactsWA: true,
            flow: true,
            marketingSends: true,
            nodeAction: true,
            nodeCheckPoint: true,
            nodeDistributeFlow: true,
            nodeEmailSending: true,
            nodeInitial: true,
            nodeInsertLeaderInAudience: true,
            nodeInterruption: true,
            nodeInterruptionLinkTackingPixel: true,
            nodeLinkTackingPixel: true,
            nodeLogicalConditionData: true,
            nodeMathematicalOperators: true,
            nodeMenu: true,
            nodeMessage: true,
            nodeNewCardTrello: true,
            nodeNotifyNumber: true,
            nodeReply: true,
            nodeSendAudio: true,
            nodeSendContactData: true,
            nodeSendFile: true,
            nodeSendHumanService: true,
            nodeSendImage: true,
            nodeSendLink: true,
            nodeSendLocationGPS: true,
            nodeSendPdf: true,
            nodeSendVideo: true,
            nodeSwitch: true,
            nodeTime: true,
            nodeWebform: true,
            nodeWebhook: true,
            users: true,
          },
        },
        PlanPeriods: {
          orderBy: { price: "asc" },
          select: {
            id: true,
            label: true,
            price_after_renovation: true,
            price: true,
            cycle: true,
          },
        },
      },
    });

    if (!plan) {
      throw new ErrorResponse(400).toast({
        title: `Plano não foi encontrado!`,
        type: "error",
      });
    }

    const coupomValid = plan.ApplicableCoupons.find((ap) => {
      if (ap.Coupon.validFrom && ap.Coupon.validUntil) {
        const now = new Date();
        if (now < ap.Coupon.validFrom || now > ap.Coupon.validUntil) {
          return false;
        }
      }
      if (ap.Coupon.validFrom && !ap.Coupon.validUntil) {
        const now = new Date();
        if (now < ap.Coupon.validFrom) {
          return false;
        }
      }
      if (ap.Coupon.validUntil && !ap.Coupon.validFrom) {
        const now = new Date();
        if (now > ap.Coupon.validUntil) {
          return false;
        }
      }
      if (
        ap.Coupon.maxQuantity &&
        ap.Coupon.quantityUsed >= ap.Coupon.maxQuantity
      ) {
        return false;
      }
      return true;
    });

    const planPeriods = plan.PlanPeriods?.map((pp) => {
      let discount: Decimal = new Decimal(0);
      if (coupomValid?.Coupon.discountType === "PERCENTAGE") {
        discount = pp.price.minus(
          pp.price.times(coupomValid.Coupon.discountValue / 100)
        );
      } else if (coupomValid?.Coupon.discountType === "REAL") {
        discount = pp.price.minus(coupomValid.Coupon.discountValue);
      }

      if (pp.price.lessThan(0)) discount = new Decimal(0);

      return { ...pp, ...(!!coupomValid && !!affiliateId && { discount }) };
    });

    const assestNodes = Object.entries(plan.PlanAssets).map((assets) => {
      const assetsKey = assets[0] as keyof Omit<PlanAssets, "id" | "planId">;
      if (/^(node)\S+/i.test(assetsKey) && assets[1]) {
        return {
          label: objectLabelAssets[assetsKey],
          value: true,
          key: assetsKey,
        };
      }
    });
    const assestQnt = Object.entries(plan.PlanAssets).map((assets) => {
      const assetsKey = assets[0] as keyof Omit<PlanAssets, "id" | "planId">;
      if (!/^(node)\S+/i.test(assetsKey)) {
        const assetsValue = assets[1];
        return {
          label: objectLabelAssets[assetsKey],
          value: assetsValue,
          key: assetsKey,
        };
      }
    });

    return {
      message: "OK",
      status: 200,
      plan: {
        ...plan,
        free_trial_time: isUsedFreeTrialTime ? undefined : plan.free_trial_time,
        PlanPeriods: planPeriods,
        PlanAssets: {
          qnt: assestQnt.filter((s) => s),
          nodes: assestNodes.filter((s) => s),
        },
      },
    };
  }
}
