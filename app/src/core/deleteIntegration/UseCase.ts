import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteIntegrationDTO_I } from "./DTO";
import { DeleteIntegrationRepository_I } from "./Repository";

export class DeleteIntegrationUseCase {
  constructor(private repository: DeleteIntegrationRepository_I) {}

  async run(dto: DeleteIntegrationDTO_I) {
    const exist = await this.repository.fetchExist(dto);

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Integração não existe ou não esta autorizado`,
        type: "error",
      });
    }

    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
