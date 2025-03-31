import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { UpdateFunnelKanbanTicketRepository_I } from "./Repository";

export class UpdateFunnelKanbanTicketImplementation
  implements UpdateFunnelKanbanTicketRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchUser(props: { userId: number }): Promise<{
    businessId: number;
  } | null> {
    try {
      return await this.prisma.sectorsAttendants.findFirst({
        where: { id: props.userId },
        select: { businessId: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }

  async createTicketInColumn(props: {
    columnId: number;
    ticketId: number;
    sequence: number;
  }): Promise<void> {
    try {
      await this.prisma.stepsFunnelKanbanOnTickets.create({
        data: {
          sequence: props.sequence,
          stepsFunnelKanbanId: props.columnId,
          ticketsId: props.ticketId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }

  async deleteColumn(props: {
    userId: number;
    funnelId: number;
    columnId: number;
    ticketId: number;
  }): Promise<void> {
    try {
      await this.prisma.stepsFunnelKanbanOnTickets.delete({
        where: { ticketsId: props.ticketId },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }

  async fetchTicket(props: {
    userId: number;
    funnelId: number;
    columnId: number;
    rows: {
      ticketId: number;
    };
  }): Promise<number> {
    try {
      return await this.prisma.stepsFunnelKanbanOnTickets.count({
        where: {
          ticketsId: props.rows.ticketId,
          stepsFunnelKanbanId: props.columnId,
          StepsFunnelKanban: {
            funnelKanbanId: props.funnelId,
            id: props.columnId,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }

  async updateColumn(props: {
    userId: number;
    funnelId: number;
    columnId: number;
    rows: {
      newSequence: number;
      ticketId: number;
    };
  }): Promise<void> {
    try {
      await this.prisma.stepsFunnelKanbanOnTickets.update({
        where: {
          ticketsId: props.rows.ticketId,
          stepsFunnelKanbanId: props.columnId,
          StepsFunnelKanban: {
            funnelKanbanId: props.funnelId,
            id: props.columnId,
          },
        },
        data: { sequence: props.rows.newSequence },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }
}
