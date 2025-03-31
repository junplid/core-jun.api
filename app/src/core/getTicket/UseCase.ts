import { LibWebSocketHumanService } from "../../libs/WebSocket/humanService";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetTicketDTO_I } from "./DTO";
import { GetTicketRepository_I } from "./Repository";

const typesUsers: { [x: number]: "supervisor" | "sectorsAttendants" } = {
  0: "sectorsAttendants",
  1: "supervisor",
};

interface Ticket {
  id: number;
  status: "new" | "open" | "resolved";
  attendantId?: number;
  content: {
    protocol: string;
    contactName: string;
    contactNumber: string;
    contactImg: string;
    columnId: number;
    sectorName: string;
    businessName: string;
    countUnreadMsg: number;
    lastMsg?: { value: string; date: Date };
  };
}

export class GetTicketUseCase {
  constructor(private repository: GetTicketRepository_I) {}

  async run(dto: GetTicketDTO_I) {
    const typesU = await Promise.all([
      this.repository.fetchSectorsAttendants(dto.userId),
      this.repository.fetchSuperVisor(dto.userId),
    ]);

    const typeUser = typesUsers[typesU.findIndex((t) => t)];

    if (typeUser !== "sectorsAttendants") {
      throw new ErrorResponse(400).toast({
        title: `Você não tem permissão para ver tickets`,
        type: "error",
      });
    }

    const attendant = await this.repository.fetchInfoSectorAttendant(
      dto.userId
    );
    if (!attendant) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }
    if (!attendant.sectorsId) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const ticketData = await this.repository.fetchTicket({
      ...dto,
    });

    if (!ticketData) {
      const libSocketHumanService = new LibWebSocketHumanService(
        attendant.businessId
      );
      libSocketHumanService.DeleteTicket(dto.id);
      throw { message: "Ticket não encontrado.", status: 400 };
    }

    const {
      businessId,
      destination,
      sectorId,
      destinationSectorsAttendantsId,
      ...ticket
    } = ticketData;

    if (!attendant.previewTicketBusiness && !attendant.previewTicketSector) {
      if (destination === "attendant") {
        if (destinationSectorsAttendantsId !== dto.userId) {
          throw {
            message:
              "Você só tem permissão para ver os tickets que foram destinados a você.",
            status: 400,
          };
        }
      }
    }

    if (attendant.previewTicketSector && sectorId !== attendant.sectorsId) {
      throw {
        message: "Você só tem permissão para ver os tickets do seu setor.",
        status: 400,
      };
    }

    if (
      attendant.previewTicketBusiness &&
      businessId !== attendant.businessId
    ) {
      throw {
        message: "Você só tem permissão para ver os tickets do seu negócio.",
        status: 400,
      };
    }

    return { message: "Sucesso!", status: 200, ticket };
  }
}
