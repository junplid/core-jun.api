import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreatePushTokenDTO_I } from "./DTO";

export class CreatePushTokenUseCase {
  constructor() {}

  async run({ accountId, ...rest }: CreatePushTokenDTO_I) {
    try {
      await prisma.pushTokens.upsert({
        where: { token: rest.token },
        update: { accountId, lastUsedAt: new Date(), ...rest },
        create: { ...rest, accountId },
      });

      return {
        message: "OK",
        status: 201,
      };
    } catch (error) {
      throw new ErrorResponse(400).container(
        "Error ao tentar criar push token."
      );
    }
  }
}
