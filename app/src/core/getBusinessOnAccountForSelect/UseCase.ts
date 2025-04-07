import { GetBusinessOnAccountForSelectRepository_I } from "./Repository";
import { GetBusinessOnAccountForSelectDTO_I } from "./DTO";

export class GetBusinessOnAccountForSelectUseCase {
  constructor(private repository: GetBusinessOnAccountForSelectRepository_I) {}

  async run(dto: GetBusinessOnAccountForSelectDTO_I) {
    const businesses = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      businesses,
    };
  }
}
