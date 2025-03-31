import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  PropsAlreadyExisting,
  PropsUpdate,
  UpdateReportLeadHumanServiceRepository_I,
} from "./Repository";

export class UpdateReportLeadHumanServiceImplementation
  implements UpdateReportLeadHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({ id, value, type }: PropsUpdate): Promise<void> {
    try {
      await this.prisma.humanServiceReportLead.update({
        where: { id, type },
        data: { value },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async alreadyExisting(props: PropsAlreadyExisting): Promise<number> {
    try {
      return await this.prisma.humanServiceReportLead.count({
        where: {
          id: props.id,
          HumanServiceOnBusinessOnContactsWAOnAccount: {
            Business: { SectorsAttendants: { some: { id: props.userId } } },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}
