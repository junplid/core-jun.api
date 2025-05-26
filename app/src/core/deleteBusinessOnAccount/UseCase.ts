import { DeleteBusinessOnAccountRepository_I } from "./Repository";
import { DeleteBusinessOnAccountDTO_I } from "./DTO";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import {
  CacheSessionsBaileysWA,
  sessionsBaileysWA,
} from "../../adapters/Baileys";
import { resolve } from "path";
import { readFile, writeFileSync } from "fs-extra";
import { ErrorResponse } from "../../utils/ErrorResponse";

async function removeBusinessId(businessId: number) {
  const flows = await ModelFlows.find({ businessIds: businessId });

  for (const flow of flows) {
    if (flow.businessIds.length === 1 && flow.businessIds[0] === businessId) {
      await ModelFlows.deleteOne({ _id: flow._id });
    } else {
      await ModelFlows.updateOne(
        { _id: flow._id },
        { $pull: { businessIds: businessId } }
      );
    }
  }
}

export class DeleteBusinessOnAccountUseCase {
  constructor(private repository: DeleteBusinessOnAccountRepository_I) {}

  async run(dto: DeleteBusinessOnAccountDTO_I) {
    const exist = await this.repository.fetchExist(dto);

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Negócio não encontrado ou você não está autorizado!`,
        type: "error",
      });
    }

    await this.repository.delete(dto);
    await removeBusinessId(dto.id);

    const client = sessionsBaileysWA.get(dto.id);
    if (client) {
      client.end(new Error("Desconectado pelo servidor!"));
    }

    const fileBin = resolve(__dirname, "../../../bin");
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
    } catch (error) {
      console.log("Error");
    }

    return { message: "OK!", status: 200 };
  }
}
