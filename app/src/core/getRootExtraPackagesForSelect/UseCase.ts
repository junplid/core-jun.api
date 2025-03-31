import { GetRootExtraPackagesForSelectDTO_I } from "./DTO";
import { GetRootExtraPackagesForSelectRepository_I } from "./Repository";

export class GetRootExtraPackagesForSelectUseCase {
  constructor(private repository: GetRootExtraPackagesForSelectRepository_I) {}

  async run(dto: GetRootExtraPackagesForSelectDTO_I) {
    return {
      message: "OK!",
      status: 200,
      extras: await this.repository.fetch(),
    };
  }
}
