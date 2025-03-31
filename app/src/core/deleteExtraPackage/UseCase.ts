import { DeleteExtraPackageDTO_I } from "./DTO";
import { DeleteExtraPackageRepository_I } from "./Repository";

export class DeleteExtraPackageUseCase {
  constructor(private repository: DeleteExtraPackageRepository_I) {}

  async run({ rootId, ...dto }: DeleteExtraPackageDTO_I) {
    await this.repository.delete({ id: dto.id });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
