import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  PropsAlreadyExisting,
  PropsUpdate,
  UpdatePosFunnelKanbanRepository_I,
} from "./Repository";

export class UpdatePosFunnelKanbanImplementation
  implements UpdatePosFunnelKanbanRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update(props: PropsUpdate): Promise<void> {
    try {
      await this.prisma.stepsFunnelKanbanOnTickets.update({
        where: {
          ticketsId: props.ticketId,
          StepsFunnelKanban: { funnelKanbanId: props.funnelKanbanId },
        },
        data: {
          sequence: props.nextSequence,
          stepsFunnelKanbanId: props.columnId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async alreadyExisting(
    props: PropsAlreadyExisting
  ): Promise<{ sequence: number } | null> {
    try {
      return await this.prisma.stepsFunnelKanban.findFirst({
        where: {
          id: props.columnId,
          FunnelKanban: {
            id: props.funnelKanbanId,
            Sectors: {
              some: {
                SectorsAttendants: {
                  some: { id: props.userId },
                },
              },
            },
          },
        },
        select: { sequence: true },
        orderBy: { sequence: "desc" },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}
