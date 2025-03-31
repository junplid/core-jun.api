import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdatePasswordHumanServiceDTO_I } from "./DTO";
import { UpdatePasswordHumanServiceRepository_I } from "./Repository";

export class UpdatePasswordHumanServiceUseCase {
  constructor(private repository: UpdatePasswordHumanServiceRepository_I) {}

  async run(dto: UpdatePasswordHumanServiceDTO_I) {
    const alreadyExists = await this.repository.alreadyExisting(
      dto.accountId,
      dto.type
    );

    if (!alreadyExists) {
      throw new ErrorResponse(401).toast({
        title: `Você não está autorizado`,
        type: "error",
      });
    }

    await this.repository.update(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
