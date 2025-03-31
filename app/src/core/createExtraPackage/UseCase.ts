import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateExtraPackageDTO_I } from "./DTO";
import { CreateExtraPackageRepository_I } from "./Repository";

export class CreateExtraPackageUseCase {
  constructor(private repository: CreateExtraPackageRepository_I) {}

  async run({ rootId, ...dto }: CreateExtraPackageDTO_I) {
    const alreadyExist = await this.repository.fetchExist({
      name: dto.name,
    });
    if (alreadyExist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe um pacote extra {ativo} com o nome",
      });
    }

    return {
      message: "OK!",
      status: 201,
      extraPackage: await this.repository.create(dto),
    };
  }
}
