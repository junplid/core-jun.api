import { resolve } from "path";
import { DeleteDocumentContactAccountFileDTO_I } from "./DTO";
import { DeleteDocumentContactAccountFileRepository_I } from "./Repository";
import { remove } from "fs-extra";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteDocumentContactAccountFileUseCase {
  constructor(
    private repository: DeleteDocumentContactAccountFileRepository_I
  ) {}

  async run(dto: DeleteDocumentContactAccountFileDTO_I) {
    const data = await this.repository.deleteD(dto.id);

    if (!data.name) {
      throw new ErrorResponse(400).toast({
        title: `Documento não encontrado`,
        type: "error",
      });
    }

    const path = resolve(
      __dirname,
      "../../../",
      "static",
      "documents-contact-account",
      data.name
    );
    let error: null | string = null;
    try {
      await remove(path);
    } catch (error) {
      error = "Error ao tentar apagar arquivo da memoria";
    }

    return { message: "OK", status: 201, error };
  }
}
