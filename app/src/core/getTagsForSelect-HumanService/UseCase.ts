import { GetTagsForSelectHumanServiceRepository_I } from "./Repository";
import { GetTagsForSelectHumanServiceDTO_I } from "./DTO";

export class GetTagsForSelectHumanServiceUseCase {
  constructor(private repository: GetTagsForSelectHumanServiceRepository_I) {}

  async run(dto: GetTagsForSelectHumanServiceDTO_I) {
    const tags = await this.repository.get(dto);
    return { message: "OK!", status: 200, tags };
  }
}
