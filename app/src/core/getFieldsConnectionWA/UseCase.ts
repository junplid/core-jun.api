import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetFieldsConnectionWADTO_I } from "./DTO";
import { GetFieldsConnectionWARepository_I } from "./Repository";

export class GetFieldsConnectionWAUseCase {
  constructor(private repository: GetFieldsConnectionWARepository_I) {}

  async run(dto: GetFieldsConnectionWADTO_I) {
    const connection = await this.repository.fetch(dto.id);

    if (!connection) {
      throw new ErrorResponse(400).toast({
        title: `Conexão não foi encontrado`,
        type: "error",
      });
    }

    return {
      message: "OK!",
      status: 200,
      connection,
    };
  }
}
