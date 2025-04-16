import { CreateConnectionWhatsappRepository_I } from "./Repository";
import { CreateConnectionWhatsappDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateConnectionWhatsappUseCase {
  constructor(private repository: CreateConnectionWhatsappRepository_I) {}

  async run({ accountId, ...dto }: CreateConnectionWhatsappDTO_I) {
    // const countResource = await prisma.connectionWA.count({
    //   where: { Business: { accountId } },
    // });
    // const assets = await prisma.account.findFirst({
    //   where: { id: accountId },
    //   select: {
    //     Plan: {
    //       select: { type: true, PlanAssets: { select: { connections: true } } },
    //     },
    //     AccountSubscriptions: {
    //       where: { dateOfCancellation: null },
    //       select: {
    //         type: true,
    //         subscriptionsId: true,
    //         PlanPeriods: {
    //           select: {
    //             Plan: {
    //               select: { PlanAssets: { select: { connections: true } } },
    //             },
    //           },
    //         },
    //         ExtraPackage: {
    //           where: { type: "connections" },
    //           select: { amount: true },
    //         },
    //       },
    //     },
    //   },
    // });

    // if (assets?.Plan?.type === "paid") {
    //   const listExtraAmount = await Promise.all(
    //     assets.AccountSubscriptions.map(async (sub) => {
    //       if (sub.ExtraPackage) {
    //         const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
    //         if (!isValidSub) return (sub.ExtraPackage?.amount || 0) * -1;
    //       }
    //       return sub.ExtraPackage?.amount || 0;
    //     })
    //   );
    //   const totalAmountExtra = listExtraAmount.reduce(
    //     (prv, cur) => prv + cur,
    //     0
    //   );

    //   const listPlanAmount = await Promise.all(
    //     assets.AccountSubscriptions.map(async (sub) => {
    //       if (sub.PlanPeriods) {
    //         const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
    //         if (!isValidSub)
    //           return (sub.PlanPeriods.Plan.PlanAssets.connections || 0) * -1;
    //       }
    //       return sub.PlanPeriods?.Plan.PlanAssets.connections || 0;
    //     })
    //   );
    //   const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);

    //   const total = totalPlanExtra + totalAmountExtra;

    //   if (total - countResource <= 0) {
    //     throw new ErrorResponse(400).toast({
    //       title:
    //         "Não é possível clonar, pois o limite de conexões foi excedida.",

    //       type: "error",
    //     });
    //   }
    // }

    // if (assets?.Plan?.type === "free") {
    //   const listExtraAmount = await Promise.all(
    //     assets.AccountSubscriptions.map(async (sub) => {
    //       if (sub.ExtraPackage) {
    //         const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
    //         if (!isValidSub) return (sub.ExtraPackage?.amount || 0) * -1;
    //       }
    //       return sub.ExtraPackage?.amount || 0;
    //     })
    //   );
    //   const totalAmountExtra = listExtraAmount.reduce(
    //     (prv, cur) => prv + cur,
    //     0
    //   );

    //   const total = assets.Plan.PlanAssets.connections + totalAmountExtra;
    //   if (total - countResource <= 0) {
    //     throw new ErrorResponse(400).toast({
    //       title:
    //         "Não é possível clonar, pois o limite de conexões foi excedida.",

    //       type: "error",
    //     });
    //   }
    // }

    const exist = await this.repository.fetchExistWithThisName(dto);

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe uma conexão com este nome.",
      });
    }

    const data = await this.repository.create(dto);

    return {
      message: "Conexão criada com sucesso!",
      status: 201,
      ...data,
    };
  }
}
