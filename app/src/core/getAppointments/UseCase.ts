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
      });

      const nextAppointments = appointments.map(({ ...ap }) => {
        return {
          ...ap,
          // contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
          // ticket:
          //   ContactsWAOnAccount?.Tickets.map((tk) => {
          //     const isConnected = !!cacheConnectionsWAOnline.get(
          //       tk.ConnectionWA.id
          //     );
          //     return {
          //       connection: { ...tk.ConnectionWA, s: isConnected },
          //       id: tk.id,
          //       // lastMessage: tk.Messages[0].by,
          //       departmentName: tk.InboxDepartment.name,
          //       status: tk.status,
          //     };
          //   }) || [],
        };
      });

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
