import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateDocumentContactAccountFileDTO_I } from "./DTO";
import { CreateDocumentContactAccountFileRepository_I } from "./Repository";

export class CreateDocumentContactAccountFileUseCase {
  constructor(
    private repository: CreateDocumentContactAccountFileRepository_I
  ) {}

  async run(dto: CreateDocumentContactAccountFileDTO_I) {
    if (!dto.name) {
      // apagar o arquivo
      throw new ErrorResponse(400).toast({
        title: "Error ao tentar salvar o arquivo sem nome",
        type: "error",
      });
    }

    const contactAccountId = await this.repository.fetchContactAccount(
      dto.ticketId
    );

    if (!contactAccountId) {
      throw new ErrorResponse(400).toast({
        title: "Não foi possível atribuir documento. Contato não encontrado",
        type: "error",
      });
    }

    const { id } = await this.repository.create({
      type: dto.type,
      name: dto.name,
      contactAccountId,
    });

    return { message: "OK", status: 201, document: { id, file: dto.name } };
  }
}
