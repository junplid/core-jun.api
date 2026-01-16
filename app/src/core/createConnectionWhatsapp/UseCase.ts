import { CreateConnectionWADTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { resolve } from "path";
import { remove } from "fs-extra";

export class CreateConnectionWAUseCase {
  constructor() {}

  async run({ accountId, agentId, ...dto }: CreateConnectionWADTO_I) {
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
    const getAccount = await prisma.account.findFirst({
      where: { id: accountId },
      select: { isPremium: true },
    });
    if (!getAccount) throw new ErrorResponse(400).container("Não autorizado.");

    const countResource = await prisma.connectionWA.count({
      where: { Business: { accountId } },
    });

    if (!getAccount.isPremium && countResource > 1) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Limite de conexões atingido.",
      });
    }

    try {
      const exist = await prisma.connectionWA.findFirst({
        where: {
          name: dto.name,
          type: dto.type,
          Business: { id: dto.businessId, accountId },
        },
        select: { id: true },
      });

      if (exist) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: "Já existe uma conexão com este nome.",
        });
      }

      const data = await prisma.connectionWA.create({
        data: {
          name: dto.name,
          description: dto.description,
          type: dto.type,
          businessId: dto.businessId,
          ...(agentId && { AgentAI: { connect: { id: agentId } } }),
        },
        select: {
          id: true,
          createAt: true,
          Business: { select: { name: true, id: true } },
        },
      });

      const { businessId, name, type, description, fileNameImage, ...config } =
        dto;

      const hasConfig = !!(Object.keys(config).length || fileNameImage);

      if (hasConfig) {
        await prisma.connectionConfig.upsert({
          where: {
            connectionWAId: data.id,
            ConnectionWA: { Business: { accountId } },
          },
          create: {
            connectionWAId: data.id,
            ...config,
            fileNameImgPerfil: fileNameImage,
          },
          update: config,
        });
      }

      return { message: "OK!", status: 201, connectionWA: data };
    } catch (error) {
      if (dto.fileNameImage) {
        const path = resolve(
          __dirname,
          "../../../",
          "static",
          "image",
          dto.fileNameImage
        );
        await remove(path).catch((error) => {
          console.log("Não foi possivel deletar a imagem antiga", error);
        });
      }
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Erro ao criar conexão.",
        type: "error",
      });
    }
  }
}
