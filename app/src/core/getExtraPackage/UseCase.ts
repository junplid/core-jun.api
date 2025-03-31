import { GetExtraPackageDTO_I } from "./DTO";
import { GetExtraPackageRepository_I } from "./Repository";

export class GetExtraPackageUseCase {
  constructor(private repository: GetExtraPackageRepository_I) {}

  async run(dto: GetExtraPackageDTO_I) {
    return {
      message: "OK!",
      status: 200,
      extraPackage: await this.repository.fetch(dto),
    };
  }
}
