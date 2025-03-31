import { DeleteLinkTackingPixelRepository_I } from "./Repository";
import { DeleteLinkTackingPixelDTO_I } from "./DTO";

export class DeleteLinkTackingPixelUseCase {
  constructor(private repository: DeleteLinkTackingPixelRepository_I) {}

  async run(dto: DeleteLinkTackingPixelDTO_I) {
    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
