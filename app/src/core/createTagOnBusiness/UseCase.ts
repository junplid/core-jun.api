import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTagOnBusinessDTO_I } from "./DTO";
import { CreateTagOnBusinessRepository_I } from "./Repository";

export class CreateTagOnBusinessUseCase {
  constructor(private repository: CreateTagOnBusinessRepository_I) {}

  async run(dto: CreateTagOnBusinessDTO_I) {
    const exist = await this.repository.fetchExist(dto);

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Tag já existe`,
      });
    }

    const { tagId } = await this.repository.create(dto);

    return {
      message: "OK!",
      status: 201,
      tagId,
    };
  }
}
