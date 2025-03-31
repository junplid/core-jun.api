import { GetVariablesForSelectHumanServiceRepository_I } from "./Repository";
import { GetVariablesForSelectHumanServiceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetVariablesForSelectHumanServiceUseCase {
  constructor(
    private repository: GetVariablesForSelectHumanServiceRepository_I
  ) {}

  async run(dto: GetVariablesForSelectHumanServiceDTO_I) {
    const variables = await this.repository.get(dto);
    return { message: "OK!", status: 200, variables };
  }
}
