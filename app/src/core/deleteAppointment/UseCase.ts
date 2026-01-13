import { DeleteAppointmentDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { socketIo } from "../../infra/express";

export class DeleteAppointmentUseCase {
  constructor() {}

  async run(dto: DeleteAppointmentDTO_I) {
    const exist = await prisma.appointments.findFirst({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Compromisso não encontrado`,
        type: "error",
      });
    }

    await prisma.appointmentReminders.delete({ where: { id: dto.id } });

    cacheAccountSocket
      .get(dto.accountId)
      ?.listSocket?.forEach(async (sockId) => {
        socketIo.to(sockId.id).emit(`appointment:remove`, {
          accountId: dto.accountId,
          id: dto.id,
        });
      });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
