import { prisma } from "../../adapters/Prisma/client";
import { connectedDevices } from "../../infra/websocket/cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTestPrintDTO_I } from "./DTO";

export class CreateTestPrintUseCase {
  constructor() {}

  async run({ uuid, accountId }: CreateTestPrintDTO_I) {
    const exist = await prisma.menusOnline.findFirst({
      where: { uuid },
      select: {
        deviceId_app_agent: true,
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Cardápio digital não encontrado.",
      );
    }
    console.log("passou");
    if (!exist.deviceId_app_agent) {
      throw new ErrorResponse(400).toast({
        title: "Dispositivo desconectado!",
        type: "error",
      });
    }
    const socket = connectedDevices.get(exist.deviceId_app_agent);

    if (!socket) {
      console.log("Device offline");
      throw new ErrorResponse(400).toast({
        title: "Dispositivo desconectado!",
        type: "error",
      });
    }

    socket.emit("TEST_PRINT", { code: "123456" });

    console.log("TEST_PRINT enviado");

    return {
      status: 200,
    };
  }
}
