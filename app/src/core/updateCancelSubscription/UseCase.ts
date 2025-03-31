import { resolve } from "path";
import {
  CacheSessionsBaileysWA,
  sessionsBaileysWA,
} from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";
import { updateAsaasSubscription } from "../../services/Assas/Subscriptions";
import { UpdateCancelSubscriptionDTO_I } from "./DTO";
import { readFile, writeFileSync } from "fs-extra";
import { ModelFlows } from "../../adapters/mongo/models/flows";

const disconnectWA = async (id: number) => {
  const client = sessionsBaileysWA.get(id);
  if (client) {
    client.end(new Error("Desconectado pelo servidor!"));
  }

  const fileBin = resolve(__dirname, "../../bin");
  const pathFileConnection = `${fileBin}/connections.json`;

  await new Promise<void>((res, rej) =>
    readFile(pathFileConnection, (err, file) => {
      if (err) return rej("Error na leitura no arquivo de conexões");
      const listConnections: CacheSessionsBaileysWA[] = JSON.parse(
        file.toString()
      );
      const nextList = JSON.stringify(
        listConnections.filter(
          ({ connectionWhatsId }) => connectionWhatsId !== id
        )
      );
      writeFileSync(pathFileConnection, nextList);
      return res();
    })
  );
};

export class UpdateCancelSubscriptionUseCase {
  constructor() {}

  async run(dto: UpdateCancelSubscriptionDTO_I) {
    const subscription = await prisma.accountSubscriptions.findUnique({
      where: { id: dto.id, accountId: dto.accountId },
      select: { subscriptionsId: true, type: true, extraPackageId: true },
    });

    if (subscription?.subscriptionsId) {
      await prisma.accountSubscriptions.update({
        where: { id: dto.id },
        data: { dateOfCancellation: new Date() },
      });
      await updateAsaasSubscription(subscription?.subscriptionsId, {
        status: "INACTIVE",
      });
    }

    if (subscription?.type === "PLAN") {
      const planFree = await prisma.plan.findFirst({
        where: { type: "free", isDefault: true },
        select: { id: true, PlanAssets: true },
      });
      if (planFree) {
        await prisma.account.update({
          where: { id: dto.accountId },
          data: { planId: planFree.id },
        });
      }
      const planAccount = await prisma.plan.findFirst({
        where: { Account: { some: { id: dto.accountId } } },
        select: { PlanAssets: true },
      });

      if (planAccount) {
        const extraAccount = await prisma.extraPackageOnAccount.findFirst({
          where: { accountId: dto.accountId },
          select: {
            ExtraPackage: { select: { type: true, amount: true } },
          },
        });

        if (planAccount.PlanAssets.attendants) {
          const amountValid =
            planAccount.PlanAssets.attendants +
            (extraAccount?.ExtraPackage.type === "attendants"
              ? extraAccount.ExtraPackage.amount
              : 0);
          const resource = await prisma.sectorsAttendants.findMany({
            where: { accountId: dto.accountId },
            skip: amountValid,
            select: { id: true },
          });
          if (!!resource.length) {
            resource.forEach(({ id }) => {
              prisma.sectorsAttendants.delete({ where: { id } });
            });
          }
        }
        if (planAccount.PlanAssets.business) {
          const amountValid =
            planAccount.PlanAssets.business +
            (extraAccount?.ExtraPackage.type === "business"
              ? extraAccount.ExtraPackage.amount
              : 0);
          const resource = await prisma.business.findMany({
            where: { accountId: dto.accountId },
            skip: amountValid,
            select: {
              id: true,
              ConnectionOnBusiness: { select: { id: true } },
            },
          });
          if (!!resource.length) {
            resource.forEach(async (s) => {
              await ModelFlows.deleteMany({
                _id: { $in: resource.map((r) => r.id) },
              });
              s.ConnectionOnBusiness.forEach((c) => {
                disconnectWA(c.id);
              });
            });
            prisma.business.deleteMany({
              where: { id: { in: resource.map((s) => s.id) } },
            });
          }
        }
        if (planAccount.PlanAssets.chatbots) {
          const amountValid =
            planAccount.PlanAssets.chatbots +
            (extraAccount?.ExtraPackage.type === "chatbotConversations"
              ? extraAccount.ExtraPackage.amount
              : 0);
          const resource = await prisma.chatbot.findMany({
            where: { accountId: dto.accountId },
            skip: amountValid,
            select: { id: true },
          });
          if (!!resource.length) {
            resource.forEach(({ id }) => {
              prisma.chatbot.delete({ where: { id } });
            });
          }
        }
        if (planAccount.PlanAssets.connections) {
          const amountValid =
            planAccount.PlanAssets.connections +
            (extraAccount?.ExtraPackage.type === "connections"
              ? extraAccount.ExtraPackage.amount
              : 0);
          const resource = await prisma.connectionOnBusiness.findMany({
            where: { Business: { accountId: dto.accountId } },
            skip: amountValid,
            select: { id: true },
          });
          if (!!resource.length) {
            resource.forEach(async ({ id }) => disconnectWA(id));
            prisma.connectionOnBusiness.deleteMany({
              where: { id: { in: resource.map((s) => s.id) } },
            });
          }
        }
        if (planAccount.PlanAssets.contactsWA) {
          const amountValid =
            planAccount.PlanAssets.contactsWA +
            (extraAccount?.ExtraPackage.type === "contactsWA"
              ? extraAccount.ExtraPackage.amount
              : 0);
          const resource = await prisma.contactsWAOnAccount.findMany({
            where: { accountId: dto.accountId },
            skip: amountValid,
            select: { id: true },
          });
          if (!!resource.length) {
            prisma.contactsWAOnAccount.deleteMany({
              where: { id: { in: resource.map((s) => s.id) } },
            });
          }
        }
        if (planAccount.PlanAssets.marketingSends) {
          const amountValid =
            planAccount.PlanAssets.marketingSends +
            (extraAccount?.ExtraPackage.type === "marketingSends"
              ? extraAccount.ExtraPackage.amount
              : 0);
          const resource = await prisma.campaign.findMany({
            where: { accountId: dto.accountId },
            skip: amountValid,
            select: { id: true },
          });
          if (!!resource.length) {
            prisma.campaign.deleteMany({
              where: { id: { in: resource.map((s) => s.id) } },
            });
          }
        }
        if (planAccount.PlanAssets.users) {
          const amountValid =
            planAccount.PlanAssets.users +
            (extraAccount?.ExtraPackage.type === "users"
              ? extraAccount.ExtraPackage.amount
              : 0);
          const resource = await prisma.subAccount.findMany({
            where: { accountId: dto.accountId },
            skip: amountValid,
            select: { id: true },
          });
          if (!!resource.length) {
            prisma.subAccount.deleteMany({
              where: { id: { in: resource.map((s) => s.id) } },
            });
          }
        }
        if (planAccount.PlanAssets.flow) {
          const amountValid =
            planAccount.PlanAssets.flow +
            (extraAccount?.ExtraPackage.type === "flows"
              ? extraAccount.ExtraPackage.amount
              : 0);

          const resource = await ModelFlows.find({
            accountId: dto.accountId,
          }).skip(amountValid);
          if (!!resource.length) {
            await ModelFlows.deleteMany({
              _id: { $in: resource.map((r) => r.id) },
            });
          }
        }

        // nos fluxos, deletar todos os blocos nodes que não são do plano, deixar apenas do plano free
      }
    }

    if (subscription?.type === "EXTRA") {
      const extraAccount = await prisma.extraPackageOnAccount.findFirst({
        where: {
          extraId: subscription.extraPackageId!,
          accountId: dto.accountId,
        },
        select: {
          id: true,
          ExtraPackage: { select: { type: true, amount: true } },
        },
      });
      if (extraAccount?.id) {
        prisma.extraPackageOnAccount.delete({
          where: { id: extraAccount?.id },
        });
      }
      if (extraAccount?.ExtraPackage.type === "attendants") {
        const resource = await prisma.sectorsAttendants.findMany({
          where: { accountId: dto.accountId },
          take: extraAccount?.ExtraPackage.amount,
          select: { id: true },
        });
        if (!!resource.length) {
          resource.forEach(({ id }) => {
            prisma.sectorsAttendants.delete({ where: { id } });
          });
        }
      }

      if (extraAccount?.ExtraPackage.type === "users") {
        const resource = await prisma.subAccount.findMany({
          where: { accountId: dto.accountId },
          take: extraAccount?.ExtraPackage.amount,
          select: { id: true },
        });
        if (!!resource.length) {
          resource.forEach(({ id }) => {
            prisma.subAccount.delete({ where: { id } });
          });
        }
      }

      if (extraAccount?.ExtraPackage.type === "chatbotConversations") {
        const resource = await prisma.chatbot.findMany({
          where: { accountId: dto.accountId },
          take: extraAccount?.ExtraPackage.amount,
          select: { id: true },
        });
        if (!!resource.length) {
          resource.forEach(({ id }) => {
            prisma.chatbot.delete({ where: { id } });
          });
        }
      }

      if (extraAccount?.ExtraPackage.type === "connections") {
        const resource = await prisma.connectionOnBusiness.findMany({
          where: { Business: { accountId: dto.accountId } },
          take: extraAccount?.ExtraPackage.amount,
          select: { id: true },
        });

        if (!!resource.length) {
          resource.forEach(async ({ id }) => disconnectWA(id));
          prisma.connectionOnBusiness.deleteMany({
            where: { id: { in: resource.map((s) => s.id) } },
          });
        }
      }

      if (extraAccount?.ExtraPackage.type === "contactsWA") {
        const resource = await prisma.contactsWAOnAccount.findMany({
          where: { accountId: dto.accountId },
          take: extraAccount?.ExtraPackage.amount,
          select: { id: true },
        });
        if (!!resource.length) {
          resource.forEach(({ id }) => {
            prisma.contactsWAOnAccount.delete({ where: { id } });
          });
        }
      }

      if (extraAccount?.ExtraPackage.type === "marketingSends") {
        const resource = await prisma.campaign.findMany({
          where: { accountId: dto.accountId },
          take: extraAccount?.ExtraPackage.amount,
          select: { id: true },
        });
        if (!!resource.length) {
          prisma.campaign.deleteMany({
            where: { id: { in: resource.map((s) => s.id) } },
          });
        }
      }

      if (extraAccount?.ExtraPackage.type === "flows") {
        const resource = await ModelFlows.find({
          accountId: dto.accountId,
        }).limit(extraAccount?.ExtraPackage.amount);
        if (!!resource.length) {
          await ModelFlows.deleteMany({
            _id: { $in: resource.map((r) => r.id) },
          });
        }
      }

      if (extraAccount?.ExtraPackage.type === "business") {
        // desconectar conexões se tiver, sair removendo tudo incluse fluxos
        const resource = await prisma.business.findMany({
          where: { accountId: dto.accountId },
          take: extraAccount?.ExtraPackage.amount,
          select: {
            id: true,
            ConnectionOnBusiness: {
              select: { id: true },
            },
          },
        });
        if (resource.length) {
          resource.forEach(async (s) => {
            await ModelFlows.deleteMany({
              _id: { $in: resource.map((r) => r.id) },
            });
            s.ConnectionOnBusiness.forEach((c) => {
              disconnectWA(c.id);
            });
          });
          await prisma.business.deleteMany({
            where: { id: { in: resource.map((s) => s.id) } },
          });
        }
      }
    }

    return { message: "OK!", status: 200 };
  }
}
