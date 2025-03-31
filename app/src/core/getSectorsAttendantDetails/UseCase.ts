import { GetSectorsAttendantDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetSectorsAttendantDetailsUseCase {
  constructor() {}

  async run(dto: GetSectorsAttendantDetailsDTO_I) {
    const attendat = await prisma.sectorsAttendants.findFirst({
      where: dto,
      select: {
        id: true,
        name: true,
        office: true,
        username: true,
        password: true,
        status: true,
        createAt: true,
        updateAt: true,
        Sectors: { select: { name: true, id: true } },
        Business: { select: { name: true, id: true } },
        previewTicketBusiness: true,
        previewTicketSector: true,
        allowAddingNotesToLeadProfile: true,
        allowInsertionAndRemovalOfTags: true,
        allowReOpeningATicket: true,
        allowStartingNewTicket: true,
        allowToUseQuickMessages: true,
      },
    });

    if (!attendat?.id) {
      throw new ErrorResponse(400).toast({
        title: `Atendente não foi encontrado!`,
        type: "error",
      });
    }

    return {
      message: "OK!",
      status: 200,
      sectorsAttendants: attendat,
    };
  }
}
