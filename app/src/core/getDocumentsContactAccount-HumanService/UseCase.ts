import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetDocumentContactAccountFileDTO_I } from "./DTO";
import { GetDocumentContactAccountFileRepository_I } from "./Repository";

export class GetDocumentContactAccountFileUseCase {
  constructor(private repository: GetDocumentContactAccountFileRepository_I) {}

  async run(dto: GetDocumentContactAccountFileDTO_I) {
    const contactAccountId = await this.repository.fetchContactAccount(
      dto.ticketId
    );

    if (!contactAccountId) {
      throw new ErrorResponse(400).toast({
        title: `Não foi buscar documentos. Contato não encontrado!`,
        type: "error",
      });
    }

    const documents = await this.repository.fetch(contactAccountId);

    return { message: "OK", status: 200, documents };
  }
}
