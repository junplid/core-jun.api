import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetDataDashboardRepository_I, Result } from "./Repository";

export class GetDataDashboardImplementation
  implements GetDataDashboardRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ accountId }: { accountId: number }): Promise<Result | null> {
    try {
      // const dataShotsPerPeriod = await this.prisma.flowState.groupBy({
      //   by: "firedOnDate",
      //   _count: true,
      //   where: { isSent: true, Campaign: { accountId } },
      //   take: 15,
      //   orderBy: { firedOnDate: "asc" },
      // });

      // const dataLeadsPerPeriod = await this.prisma.contactsWAOnAccount.groupBy({
      //   by: "createAt",
      //   orderBy: { createAt: "asc" },
      //   _count: true,
      //   take: 15,
      //   where: { accountId },
      // });

      // const data = await this.prisma.account.findUnique({
      //   where: { id: accountId },
      //   select: {
      //     name: true,
      //     ContactsWAOnAccount: {
      //       select: {
      //         createAt: true,
      //         ContactsWAOnAccountOnAudience: {
      //           select: {
      //             FlowState: {
      //               where: { isSent: true },
      //               orderBy: { firedOnDate: "desc" },
      //               select: { firedOnDate: true },
      //             },
      //           },
      //         },
      //       },
      //     },
      //     _count: {
      //       select: {
      //         Campaign: {
      //           where: {
      //             isOndemand: false,
      //             status: { in: ["processing", "running"] },
      //           },
      //         },
      //       },
      //     },
      //     Business: {
      //       select: {
      //         Chatbot: { select: { id: true } },
      //         ConnectionOnBusiness: { select: { id: true } },
      //       },
      //     },
      //   },
      // });
      // return data
      //   ? {
      //       connectionsWA: ([] as number[]).concat(
      //         ...data.Business.map((c) =>
      //           c.ConnectionOnBusiness.map((s) => s.id)
      //         )
      //       ),
      //       campaigns: data._count.Campaign,
      //       chatbots: ([] as number[]).concat(
      //         ...data.Business.map((s) => s.Chatbot.map((e) => e.id))
      //       ),
      //       leadsPerPeriod: dataLeadsPerPeriod.map((e) => ({
      //         createAt: e.createAt,
      //         value: e._count,
      //       })),
      //       shotsPerPeriod: dataShotsPerPeriod.map((e) => ({
      //         createAt: e.firedOnDate!,
      //         value: e._count,
      //       })),
      //     }
      //   : null;
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}
