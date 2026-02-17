import { readFile, writeFileSync } from "fs-extra";
import { resolve } from "path";
import {
  CacheSessionsBaileysWA,
  killConnectionWA,
} from "../../adapters/Baileys";
import { UpdateDisconnectConnectionWhatsappDTO_I } from "./DTO";
import { UpdateDisconnectConnectionWhatsappRepository_I } from "./Repository";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateDisconnectConnectionWhatsappUseCase {
  constructor(
    private repository: UpdateDisconnectConnectionWhatsappRepository_I,
  ) {}

  async run(dto: UpdateDisconnectConnectionWhatsappDTO_I) {
    const fetchExist = await this.repository.fetchExist(dto);

    if (!fetchExist) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel encontrar a conexão`,
        type: "error",
      });
    }
    await killConnectionWA(dto.id, dto.accountId);

    return {
      message: "OK!",
      status: 200,
      connectionWA: { status: "close" },
    };
  }
}
