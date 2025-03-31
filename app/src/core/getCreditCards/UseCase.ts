import { GetCreditCardDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetCreditCardUseCase {
  constructor() {}

  async run(dto: GetCreditCardDTO_I) {
    const creditCards = await prisma.creditCardsOnAccount.findMany({
      orderBy: { id: "desc" },
      where: { accountId: dto.accountId },
      select: {
        name: true,
        numberCard: true,
        band: true,
        createAt: true,
        id: true,
        AccountSubscriptions: {
          take: 1,
          orderBy: { updateAt: "desc" },
          where: { type: "PLAN" },
          select: {
            PlanPeriods: {
              select: {
                cycle: true,
                Plan: { select: { name: true, label: true } },
              },
            },
          },
        },
      },
    });

    const nextCards = creditCards.map(({ AccountSubscriptions, ...card }) => {
      return {
        ...card,
        ...(AccountSubscriptions.length &&
          AccountSubscriptions[0].PlanPeriods && {
            subPlan: {
              cycle: AccountSubscriptions[0].PlanPeriods.cycle,
              planName: AccountSubscriptions[0].PlanPeriods.Plan.name,
              planLabel: AccountSubscriptions[0].PlanPeriods.Plan.label,
            },
          }),
      };
    });

    return { message: "OK!", status: 200, creditCards: nextCards };
  }
}
