import { GetExtraPackagesRootDTO_I } from "./DTO";
import { GetExtraPackagesRootRepository_I } from "./Repository";

export class GetExtraPackagesRootUseCase {
  constructor(private repository: GetExtraPackagesRootRepository_I) {}

  async run(dto: GetExtraPackagesRootDTO_I) {
    return {
      message: "OK!",
      status: 200,
      extraPackages: await this.repository.fetch(),
    };
  }
}
