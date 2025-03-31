import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetTicketsDTO_I } from "./DTO";
import { GetTicketsRepository_I } from "./Repository";

const typesUsers: { [x: number]: "supervisor" | "sectorsAttendants" } = {
  0: "sectorsAttendants",
  1: "supervisor",
};

export class GetTicketsUseCase {
  constructor(private repository: GetTicketsRepository_I) {}

  async run(dto: GetTicketsDTO_I) {
    const typesU = await Promise.all([
      this.repository.fetchSectorsAttendants(dto.userId),
      this.repository.fetchSuperVisor(dto.userId),
    ]);

    const typeUser = typesUsers[typesU.findIndex((t) => t)];

    let infoSectorAttendant: {
      previewTicketBusiness: boolean | null;
      previewTicketSector: boolean | null;
      businessId: number;
      Sectors: { previewPhone: boolean; id: number } | null;
    } | null = null;

    if (typeUser === "sectorsAttendants") {
      infoSectorAttendant = await this.repository.fetchInfoSectorAttendant(
        dto.userId
      );
    }
    if (!infoSectorAttendant || !infoSectorAttendant.Sectors) {
      throw new ErrorResponse(400).toast({
        title: `Erro ao buscar informações do atendente`,
        type: "error",
      });
    }

    const tickets = await this.repository.fetchTickets({
      tags: dto.tags,
      previewPhone: infoSectorAttendant.Sectors.previewPhone,
      search: dto.search,
      deleted: dto.deleted,
      filter: dto.filter,
      user: typeUser,
      businessId: infoSectorAttendant.businessId,
      previewTicketBusiness: infoSectorAttendant.previewTicketBusiness,
      previewTicketSector: infoSectorAttendant.previewTicketSector,
      userId: dto.userId,
      sectorsId: infoSectorAttendant.Sectors.id,
    });

    return { message: "OK!", status: 200, tickets };
  }
}
