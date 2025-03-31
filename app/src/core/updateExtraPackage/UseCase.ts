import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateExtraPackageDTO_I } from "./DTO";
import { UpdateExtraPackageRepository_I } from "./Repository";

export class UpdateExtraPackageUseCase {
  constructor(private repository: UpdateExtraPackageRepository_I) {}

  async run(dto: UpdateExtraPackageDTO_I) {
    const alreadyExists = await this.repository.alreadyExist({
      id: dto.id,
    });

    if (!alreadyExists) {
      throw new ErrorResponse(400).toast({
        title: `Pacote Extra não foi encontrado`,
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
