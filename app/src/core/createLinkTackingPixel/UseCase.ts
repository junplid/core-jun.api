import { CreateLinkTackingPixelRepository_I } from "./Repository";
import { CreateLinkTackingPixelDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateLinkTackingPixelUseCase {
  constructor(private repository: CreateLinkTackingPixelRepository_I) {}

  async run(dto: CreateLinkTackingPixelDTO_I) {
    const isAlreadyExists = await this.repository.fetchAlreadyExists(dto);

    if (isAlreadyExists) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe Link com esse nome`,
      });
    }

    const linkTackingPixel = await this.repository.create(dto);

    return {
      message: "OK!",
      status: 201,
      linkTackingPixel,
    };
  }
}
