import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";
import { NodeControler } from "../../libs/Nodes/Control";
import {
  NodeInterruptionLinkTackingPixelData,
  NodePayload,
} from "../../libs/Nodes/Payload";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateLinkTackingPixelEventDTO_I } from "./DTO";
import { CreateLinkTackingPixelEventRepository_I } from "./Repository";

export class CreateLinkTackingPixelEventUseCase {
  constructor(private repository: CreateLinkTackingPixelEventRepository_I) {}

  async run({ flowId, flowStateId, ...dto }: CreateLinkTackingPixelEventDTO_I) {
    try {
      const infoConnection = await this.repository.findInfoConnection(
        dto.connectionWhatsId
      );
      if (!infoConnection) {
        throw new ErrorResponse(400).input({
          path: "connectionWhatsId",
          text: `Não foi possivel encontrar o número da conexão`,
        });
      }

      await this.repository.create(dto);

      const flow = await this.repository.findFlow({
        accountId: dto.accountId,
        flowId: flowId,
      });

      if (!flow) {
        throw new ErrorResponse(400).input({
          path: "flowId",
          text: `Fluxo não encontrado`,
        });
      }

      const nodes = flow.nodes as NodePayload[];

      const nodesEvents = nodes.filter((n) => {
        if (n.type === "nodeInterruptionLinkTrackingPixel") {
          if (n.data.event === dto.event && n.data.value === dto.value) {
            return true;
          }
          return false;
        }
        return false;
      });

      if (!nodesEvents.length) {
        throw new ErrorResponse(400).input({
          path: "event",
          text: `Bloco de reação do link de rastreio não encontrado`,
        });
      }

      const firstNode = nodesEvents[0] as NodePayload & {
        data: NodeInterruptionLinkTackingPixelData;
      };

      const clientWA = sessionsBaileysWA.get(dto.connectionWhatsId);

      if (!clientWA) {
        throw new ErrorResponse(400).input({
          path: "connectionWhatsId",
          text: `Conexão não encontrada`,
        });
      }

      const info = await this.repository.findInfo({
        contactsWAOnAccountId: dto.contactsWAOnAccountId,
      });

      if (!info) {
        throw new ErrorResponse(400).input({
          path: "contactsWAOnAccountId",
          text: `Informações do lead não encontradas`,
        });
      }

      const infoFlowState = await prisma.flowState.findFirst({
        where: {
          ...(dto.campaignId && { campaignId: dto.campaignId }),
          id: flowStateId,
          connectionOnBusinessId: dto.connectionWhatsId,
          contactsWAOnAccountId: dto.contactsWAOnAccountId,
        },
        select: { id: true },
      });

      if (!infoFlowState) {
        throw new ErrorResponse(400).container(
          `Estado do lead no fluxo não encontrado`
        );
      }

      await NodeControler({
        businessName: infoConnection.businessName,
        campaignId: dto.campaignId,
        type: "initial",
        ...flow,
        flowId,
        accountId: dto.accountId,
        numberConnection: infoConnection.number + "@s.whatsapp.net",
        flowStateId: infoFlowState.id,
        isSavePositionLead: false,
        lead: { number: info.numberLead.replace("+", "") + "@s.whatsapp.net" },
        connectionWhatsId: dto.connectionWhatsId,
        contactsWAOnAccountId: dto.contactsWAOnAccountId,
        currentNodeId: firstNode.id,
        clientWA,
      });

      return {
        message: "OK!",
        status: 201,
      };
    } catch (error) {
      throw new ErrorResponse(400).container(
        `Error inesperado, contato o suporte`
      );
    }
  }
}
