import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateBusinessDTO_I } from "./DTO";

export class CreateBusinessUseCase {
  constructor() {}

  async run(dto: CreateBusinessDTO_I) {
    // const countResource = await prisma.business.count({
    //   where: { accountId: dto.accountId },
    // });
    // const assets = await prisma.account.findFirst({
    //   where: { id: dto.accountId },
    //   select: {
    //     Plan: {
    //       select: { PlanAssets: { select: { business: true } } },
    //     },
    //     AccountSubscriptions: {
    //       where: { dateOfCancellation: null },
    //       select: {
    //         type: true,
    //         subscriptionsId: true,
    //         PlanPeriods: {
    //           select: {
    //             Plan: {
    //               select: { PlanAssets: { select: { business: true } } },
    //             },
    //           },
    //         },
    //         ExtraPackage: {
    //           where: { type: "business" },
    //           select: { amount: true },
    //         },
    //       },
    //     },
    //   },
    // });
    // if (assets?.AccountSubscriptions.length) {
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
    //         console.log({ isValidSub, subId: sub.subscriptionsId });
    //         if (!isValidSub)
    //           return (sub.PlanPeriods.Plan.PlanAssets.business || 0) * -1;
    //       }
    //       return sub.PlanPeriods?.Plan.PlanAssets.business || 0;
    //     })
    //   );
    //   const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);
    //   const total = totalPlanExtra + totalAmountExtra;

    //   if (total - countResource <= 0) {
    //     throw new ErrorResponse(400).toast({
    //       title: "Limite de negocios atingido. compre mais pacotes extra!",
    //       theme: "dark",
    //     });
    //   }
    // } else {
    //   if (assets?.Plan && countResource >= assets.Plan.PlanAssets.business) {
    //     throw new ErrorResponse(400).toast({
    //       title: "Limite de negocios atingido. compre mais pacotes extra!",
    //       theme: "dark",
    //     });
    //   }
    // }

    const getAccount = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: { isPremium: true },
    });
    if (!getAccount) throw new ErrorResponse(40).container("Não autorizado.");

    const countResource = await prisma.business.count({
      where: { accountId: dto.accountId },
    });

    if (!getAccount.isPremium && countResource >= 1) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Limite de projetos atingido.",
      });
    }

    const exist = await prisma.business.findFirst({
      where: { accountId: dto.accountId, name: dto.name },
      select: { id: true },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        text: "Já existe um projeto com esse nome.",
        path: "name",
      });
    }

    const business = await prisma.business.create({
      data: dto,
      select: { id: true, createAt: true, updateAt: true },
    });

    return {
      message: "Negócio criado com sucesso.",
      status: 201,
      business: business,
    };
  }
}
