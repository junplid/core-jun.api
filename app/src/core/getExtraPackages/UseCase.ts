import { GetExtraPackagesDTO_I } from "./DTO";
import { GetExtraPackagesRepository_I } from "./Repository";

export class GetExtraPackagesUseCase {
  constructor(private repository: GetExtraPackagesRepository_I) {}

  async run(dto: GetExtraPackagesDTO_I) {
    return {
      message: "OK!",
      status: 200,
      extraPackages: await this.repository.fetch(dto),
    };
  }
}
