import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetConnectionWAUserDTO_I } from "./DTO";
import { GetConnectionWAUserRepository_I } from "./Repository";

export class GetConnectionWAUserUseCase {
  constructor(private repository: GetConnectionWAUserRepository_I) {}

  async run(dto: GetConnectionWAUserDTO_I) {
    const alreadyExistConnection = await this.repository.fetchConn(dto.id);

    if (!alreadyExistConnection) {
      throw new ErrorResponse(400).toast({
        title: `Conexão não foi encontrada!`,
        type: "error",
      });
    }

    const connConfig = await this.repository.fetch({
      connectionId: dto.id,
      accountId: dto.accountId,
    });

    return {
      message: "OK!",
      status: 200,
      connConfig,
    };
  }
}
