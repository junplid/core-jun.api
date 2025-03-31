import { prisma } from "../../adapters/Prisma/client";
import { updateAsaasSubscription } from "../../services/Assas/Subscriptions";
import { UpdatePlanDTO_I, UpdatePlanQueryDTO_I } from "./DTO";

type Fields = {
  [x in keyof UpdatePlanQueryDTO_I]: boolean;
};

export class UpdatePlanUseCase {
  constructor() {}

  async run({ id, rootId, ...dto }: UpdatePlanDTO_I) {
    const exist = await prisma.plan.findFirst({
      where: { id },
    });

    if (!exist) throw { message: "Plano não encontrado!", statusCode: 400 };

    const fields: Fields = Object.fromEntries(
      Object.entries(dto).map(([name, v]) => [name, !!Number(v)])
    );

    try {
      await prisma.plan.update({ where: { id }, data: fields });

      let countSubsModif = 0;

      if (!fields.allowsRenewal || !fields.activeFoSubscribers) {
        const findSubscribers = await prisma.accountSubscriptions.findMany({
          where: { PlanPeriods: { planId: id } },
          select: { subscriptionsId: true },
        });

        for await (const { subscriptionsId } of findSubscribers) {
          await updateAsaasSubscription(subscriptionsId, {
            ...(fields.allowsRenewal !== undefined &&
              fields.allowsRenewal && {
                status: "ACTIVE",
              }),
            ...(fields.allowsRenewal !== undefined &&
              !fields.allowsRenewal && {
                status: "EXPIRED",
              }),
            ...(fields.activeFoSubscribers !== undefined &&
              fields.activeFoSubscribers && {
                status: "ACTIVE",
              }),
            ...(fields.activeFoSubscribers !== undefined &&
              !fields.activeFoSubscribers && {
                status: "INACTIVE",
              }),
          });
        }
        countSubsModif = findSubscribers.length;
      }

      return { message: "OK!", status: 200, countSubsModif };
    } catch (error) {
      console.log("atualiar plano, rota root", error);
      throw {
        message: "Error ao tentar atualizar plano",
        statusCode: 400,
      };
    }
  }
}
