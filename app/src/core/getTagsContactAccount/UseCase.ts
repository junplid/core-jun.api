import { getVariableSystem } from "../../libs/VariablesSystem";
import { GetTagsContactAccountDTO_I } from "./DTO";
import { GetTagsContactAccountRepository_I } from "./Repository";

export class GetTagsContactAccountUseCase {
  constructor(private repository: GetTagsContactAccountRepository_I) {}

  async run({ userId, ...dto }: GetTagsContactAccountDTO_I) {
    const tags = await this.repository.fetch(dto);
    return { message: "OK!", status: 200, tags };
  }
}
