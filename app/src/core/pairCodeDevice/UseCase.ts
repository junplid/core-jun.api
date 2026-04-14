import { v4 } from "uuid";
import { prisma } from "../../adapters/Prisma/client";
import { connectedDevices, pairingCodes } from "../../infra/websocket/cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { PairCodeDeviceDTO_I } from "./DTO";
import { createTokenAuth } from "../../helpers/authToken";
import { randomBytes } from "crypto";

export class PairCodeDeviceUseCase {
  constructor() {}

  async run({ accountId, ...dto }: PairCodeDeviceDTO_I) {
    const exist = await prisma.menusOnline.findFirst({
      where: { accountId, uuid: dto.uuid },
      select: { id: true, Account: { select: { hash: true } } },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Cardapio digital não encontrado.`,
        type: "error",
      });
    }

    try {
      const deviceId = v4();
      const socket = pairingCodes.get(dto.code);
      if (!socket) {
        throw new ErrorResponse(400).input({
          path: "code",
          text: "Codigo de pareamento invalido.",
        });
      }

      connectedDevices.set(deviceId, socket);
      const csrfToken = randomBytes(32).toString("hex");

      const token = await createTokenAuth(
        {
          id: accountId,
          type: "adm",
          hash: exist.Account.hash,
        },
        process.env.SECRET_TOKEN_AUTH!,
      );

      socket.emit("PAIRED", {
        deviceId,
        accountId,
        cookies: {
          access_token_app: token,
          APP_XSRF_TOKEN: csrfToken,
        },
      });
      pairingCodes.delete(dto.code);

      await prisma.menusOnline.update({
        where: { id: exist.id },
        data: { deviceId_app_agent: deviceId },
      });

      return {
        message: "OK!",
        status: 200,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar conectar disponitivo.`,
        type: "error",
      });
    }
  }
}
