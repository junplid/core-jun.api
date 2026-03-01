import moment from "moment-timezone";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateAppointmentDTO_I } from "./DTO";
import { genNumCode } from "../../utils/genNumCode";
import { webSocketEmitToRoom } from "../../infra/websocket";

export class CreateAppointmentUseCase {
  constructor() {}

  async run({ accountId, endAt, ...dto }: CreateAppointmentDTO_I) {
    try {
      const nextStartAt = moment.tz(
        `${dto.dateStartAt} ${dto.timeStartAt}`,
        "YYYY-MM-DD HH:mm",
        "America/Sao_Paulo",
      );

      if (!nextStartAt.isValid()) {
        throw new ErrorResponse(400).input({
          path: "dateStartAt",
          text: "Data ou hora inválida.",
        });
      }

      const nextEndAt = nextStartAt.clone();
      if (endAt) {
        if (endAt === "10min") {
          nextEndAt.add(10, "minute");
        } else if (endAt === "30min") {
          nextEndAt.add(30, "minute");
        } else if (endAt === "1h") {
          nextEndAt.add(1, "h");
        } else if (endAt === "1h e 30min") {
          nextEndAt.add(90, "minute");
        } else if (endAt === "2h") {
          nextEndAt.add(2, "h");
        } else if (endAt === "3h") {
          nextEndAt.add(3, "h");
        } else if (endAt === "4h") {
          nextEndAt.add(4, "h");
        } else if (endAt === "5h") {
          nextEndAt.add(5, "h");
        } else if (endAt === "10h") {
          nextEndAt.add(10, "h");
        } else if (endAt === "15h") {
          nextEndAt.add(15, "h");
        } else if (endAt === "1d") {
          nextEndAt.add(1, "day");
        } else if (endAt === "2d") {
          nextEndAt.add(2, "day");
        }
      } else {
        nextEndAt.add(1, "h");
      }

      const business = await prisma.business.findFirst({
        where: { accountId },
        select: { id: true },
      });

      if (!business) throw new ErrorResponse(401);

      const n_appointment = genNumCode(7);
      const appointment = await prisma.appointments.create({
        data: {
          n_appointment,
          status: "confirmed",
          createdBy: "human",
          title: dto.title,
          businessId: business.id,
          accountId,
          startAt: nextStartAt.toDate(),
          endAt: nextEndAt.toDate(),
        },
        select: { id: true },
      });

      webSocketEmitToRoom()
        .account(accountId)
        .appointments.new(
          {
            id: appointment.id,
            title: dto.title,
            desc: dto.desc,
            startAt: nextStartAt,
            endAt: nextEndAt,
            status: "confirmed",
          },
          dto.socketIgnore ? [dto.socketIgnore] : [],
        );

      return {
        message: "OK!",
        status: 200,
        appointment: {
          id: appointment.id,
          code: n_appointment,
          startAt: nextStartAt.toDate(),
          endAt: nextEndAt.toDate(),
          status: "confirmed",
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar compromisso!`,
        type: "error",
      });
    }
  }
}
