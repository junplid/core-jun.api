import moment from "moment-timezone";
import { prisma } from "../../adapters/Prisma/client";
import { GetQuantityOfEachFilterTicketHumanServiceDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetQuantityOfEachFilterTicketHumanServiceUseCase {
  constructor() {}

  async run(dto: GetQuantityOfEachFilterTicketHumanServiceDTO_I) {
    const attendant = await prisma.sectorsAttendants.findFirst({
      where: { id: dto.userId },
      select: {
        previewTicketBusiness: true,
        previewTicketSector: true,
        sectorsId: true,
        businessId: true,
      },
    });

    if (!attendant || !attendant.sectorsId) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    // Se o ticket é destinado ao atendente
    // Se o ticket é destinado ao setor e o atendente é do mesmo setor e o atendente por ver tickets do mesmo setor
    // se o atendente pode ver todos os tickets do negocio
    const unread = await prisma.tickets.count({
      where: {
        deleted: false,
        status: "open",
        sectorsAttendantsId: dto.userId,
        ConversationTickes: { some: { read: false, sentBy: "lead" } },
      },
    });
    const pending = await prisma.tickets.count({
      where: {
        deleted: false,
        status: "open",
        sectorsAttendantsId: dto.userId,
        ContactsWAOnAccount: {
          HumanServiceOnBusinessOnContactsWAOnAccount: {
            HumanServiceReportLead: { some: { type: "pendency" } },
          },
        },
      },
    });
    const newT = await prisma.tickets.count({
      where: {
        deleted: false,
        status: "new",
        destination: "attendant",
        sectorsAttendantsId: dto.userId,
        ...(attendant.previewTicketSector && {
          sectorsId: attendant.sectorsId,
          destination: "sector",
          sectorsAttendantsId: undefined,
        }),
        ...(attendant.previewTicketBusiness && {
          sectorsAttendantsId: undefined,
          destination: undefined,
          businessId: attendant.businessId,
        }),
      },
    });
    const resolved = await prisma.tickets.count({
      where: {
        createAt: { gte: moment().subtract(24, "hours").toDate() },
        deleted: false,
        status: "resolved",
        sectorsAttendantsId: dto.userId,
      },
    });
    const serving = await prisma.tickets.count({
      where: {
        deleted: false,
        status: "open",
        sectorsAttendantsId: dto.userId,
      },
    });

    return {
      message: "OK!",
      status: 200,
      result: {
        serving: { value: serving, color: "#28a745" },
        resolved: { value: resolved, color: "#007bff" },
        new: { value: newT, color: "#ffc107" },
        pending: { value: pending, color: "#fd7e14" },
        unread: { value: unread, color: "#dc3545" },
      },
    };
  }
}
