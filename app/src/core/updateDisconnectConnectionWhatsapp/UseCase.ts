import { readFile, writeFileSync } from "fs-extra";
import { resolve } from "path";
import {
  CacheSessionsBaileysWA,
  sessionsBaileysWA,
} from "../../adapters/Baileys";
import { UpdateDisconnectConnectionWhatsappDTO_I } from "./DTO";
import { UpdateDisconnectConnectionWhatsappRepository_I } from "./Repository";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateDisconnectConnectionWhatsappUseCase {
  constructor(
    private repository: UpdateDisconnectConnectionWhatsappRepository_I
  ) {}

  async run(dto: UpdateDisconnectConnectionWhatsappDTO_I) {
    const fetchExist = await this.repository.fetchExist(dto);

    if (!fetchExist) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel encontrar a conexão`,
        type: "error",
      });
    }

    const client = sessionsBaileysWA.get(dto.id);
    if (client) {
      client.end(new Error("Desconectado pelo servidor!"));
    }

    const fileBin = resolve(__dirname, "../../bin");
    const pathFileConnection = `${fileBin}/connections.json`;

    try {
      await new Promise<void>((res, rej) =>
        readFile(pathFileConnection, (err, file) => {
          if (err) return rej("Error na leitura no arquivo de conexões");
          const listConnections: CacheSessionsBaileysWA[] = JSON.parse(
            file.toString()
          );
          const nextList = JSON.stringify(
            listConnections.filter(
              ({ connectionWhatsId }) => connectionWhatsId !== dto.id
            )
          );
          writeFileSync(pathFileConnection, nextList);
          return res();
        })
      );
      return {
        message: "OK!",
        status: 200,
        connection: { status: "close" },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel desligar a conexão`,
        type: "error",
      });
    }
  }
}
