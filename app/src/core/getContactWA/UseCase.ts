import { DeleteContactWARepository_I } from "./Repository";
import { DeleteContactWADTO_I } from "./DTO";

export class DeleteContactWAUseCase {
  constructor(private repository: DeleteContactWARepository_I) {}

  async run(dto: DeleteContactWADTO_I) {
    const contactsWA = await this.repository.get();

    return {
      message: "OK!",
      status: 200,
      contactsWA,
    };
  }
}
