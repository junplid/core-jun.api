import { prisma } from "../../adapters/Prisma/client";
import { connectedDevices } from "../../infra/websocket/cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UnpairCodeDeviceDTO_I } from "./DTO";

export class UnpairCodeDeviceUseCase {
  constructor() {}

  async run({ accountId, ...dto }: UnpairCodeDeviceDTO_I) {
    const exist = await prisma.menusOnline.findFirst({
      where: { accountId, uuid: dto.uuid },
      select: { id: true, deviceId_app_agent: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Cardapio digital não encontrado.`,
        type: "error",
      });
    }

    try {
      if (exist.deviceId_app_agent) {
        await prisma.menusOnline.update({
          where: { id: exist.id },
          data: { deviceId_app_agent: null },
        });
        const socket = connectedDevices.get(exist.deviceId_app_agent);
        if (socket) {
          socket.emit("UNPAIR");
          socket.disconnect();
          connectedDevices.delete(exist.deviceId_app_agent);
        }
      }

      return {
        message: "OK!",
        status: 200,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar revogar dispositivo.`,
        type: "error",
      });
    }
  }
}
