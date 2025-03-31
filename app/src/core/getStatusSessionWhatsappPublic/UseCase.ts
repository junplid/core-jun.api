import { GetStatusSessionWhatsappPublicRepository_I } from "./Repository";
import { GetStatusSessionWhatsappPublicDTO_I } from "./DTO";
// import { Baileys } from "../../api/baileys";
import { ErrorResponse } from "../../interfaces/ErrorResponse";

export class GetStatusSessionWhatsappPublicUseCase {
  constructor(private repository: GetStatusSessionWhatsappPublicRepository_I) {}

  async run(dto: GetStatusSessionWhatsappPublicDTO_I & { accountId: string }) {
    // const baileys = new Baileys({
    //   accountId: Number(dto.accountId),
    //   connectionWhatsId: Number(dto.connectionId),
    // });
    // const session = baileys.getSessionSession({
    //   sessionId: dto.connectionId,
    // });

    // if (!session) {
    //   throw {
    //     detail: [
    //       {
    //         message: "Conexão não existe",
    //         path: ["not found"],
    //         type: "WA not found",
    //       },
    //     ],
    //     statusCode: 404,
    //     message: "Conexão não existe",
    //   } as ErrorResponse;
    // }

    // const statusSession = baileys.getSessionStatus({ session: session });

    return {
      message: "OK!",
      status: 200,
      statusSession: 1,
    };
  }
}
