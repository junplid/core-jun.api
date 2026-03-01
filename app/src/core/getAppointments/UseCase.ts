import { GetAppointmentsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetAppointmentsUseCase {
  constructor() {}

  async run({ limit = 1, ...dto }: GetAppointmentsDTO_I) {
    try {
      const appointments = await prisma.appointments.findMany({
        where: {
          accountId: dto.accountId,
          deleted: false,
        },
        select: {
          id: true,
          desc: true,
          title: true,
          startAt: true,
          endAt: true,
          connectionIgId: true,
          connectionWAId: true,
          status: true,
          // endAt: true,
          // tickets
          // ContactsWAOnAccount: {
          //   select: {
          //     ContactsWA: { select: { completeNumber: true } },
          //     Tickets: {
          //       where: { status: { notIn: ["DELETED", "RESOLVED"] } },
          //       select: {
          //         ConnectionWA: { select: { name: true, id: true } },
          //         id: true,
          //         InboxDepartment: { select: { name: true } },
          //         status: true,
          //         Messages: {
          //           take: 1,
          //           orderBy: { id: "desc" },
          //           select: { by: true },
          //         },
          //       },
          //     },
          //   },
          // },
        },
        orderBy: { id: "desc" },
      });

      const nextAppointments = appointments.map(
        ({ connectionWAId, connectionIgId, ...ap }) => {
          if (connectionWAId) {
            return { ...ap, channel: "baileys" };
          }
          if (connectionIgId) {
            return { ...ap, channel: "instagram" };
          }
          return { ...ap, channel: null };
        },
      );

      return {
        message: "OK!",
        status: 200,
        appointments: nextAppointments,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi achar os compromissos.",
        type: "error",
      });
    }
  }
}
