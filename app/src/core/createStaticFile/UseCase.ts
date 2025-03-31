import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateStaticFileDTO_I } from "./DTO";
import { CreateStaticFileRepository_I } from "./Repository";
import { format } from "bytes";

const isStorageExceeded = (
  fileSizeInBytes: number,
  storageLimitInGB: number
): boolean => {
  const storageLimitInBytes = storageLimitInGB * 1024 ** 3;
  return fileSizeInBytes > storageLimitInBytes;
};

export class CreateStaticFileUseCase {
  constructor(private repository: CreateStaticFileRepository_I) {}

  async run({ subUserUid, ...dto }: Required<CreateStaticFileDTO_I>) {
    const countResource = await prisma.staticPaths.findMany({
      where: { accountId: dto.accountId },
      select: { size: true },
    });
    const storageUsed = countResource.reduce((ac, cr) => {
      return ac + cr.size;
    }, 0);

    const assets = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: {
        Plan: {
          select: { PlanAssets: { select: { storageSize: true } } },
        },
        AccountSubscriptions: {
          where: { dateOfCancellation: null },
          select: {
            type: true,
            subscriptionsId: true,
            PlanPeriods: {
              select: {
                Plan: {
                  select: { PlanAssets: { select: { storageSize: true } } },
                },
              },
            },
            ExtraPackage: {
              where: { type: "storageSize" },
              select: { amount: true },
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
            if (!isValidSub) return (sub.ExtraPackage?.amount || 0) * -1;
          }
          return sub.ExtraPackage?.amount || 0;
        })
      );
      const totalAmountExtra = listExtraAmount.reduce(
        (prv, cur) => prv + cur,
        0
      );

      const listPlanAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.PlanPeriods) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            if (!isValidSub)
              return (sub.PlanPeriods.Plan.PlanAssets.storageSize || 0) * -1;
          }
          return sub.PlanPeriods?.Plan.PlanAssets.storageSize || 0;
        })
      );
      const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);
      const total = totalPlanExtra + totalAmountExtra;

      if (isStorageExceeded(storageUsed + dto.size, total)) {
        throw new ErrorResponse(400).toast({
          title: `Limite de armazenamento atingido. compre mais pacotes extra`,
          type: "error",
        });
      }
    } else {
      if (
        assets?.Plan &&
        isStorageExceeded(
          storageUsed + dto.size,
          assets.Plan.PlanAssets.storageSize
        )
      ) {
        throw new ErrorResponse(400).toast({
          title: `Limite de armazenamento atingido. compre mais pacotes extra`,
          type: "error",
        });
      }
    }

    const { id } = await this.repository.create(dto);

    return {
      message: "Arquivo criado com sucesso!",
      status: 201,
      id,
      name: dto.name,
      originalName: dto.originalName,
      size: format(dto.size),
    };
  }
}
