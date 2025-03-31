import { GetFlowOnBusinessForSelectRepository_I } from "./Repository";
import { GetFlowOnBusinessForSelectDTO_I } from "./DTO";

export class GetFlowOnBusinessForSelectUseCase {
  constructor(private repository: GetFlowOnBusinessForSelectRepository_I) {}

  async run(dto: GetFlowOnBusinessForSelectDTO_I) {
    const flows = await this.repository.fetch({
      accountId: dto.accountId,
      businessIds: dto.businessIds ?? [],
      type: dto.type,
    });

    return {
      message: "OK!",
      status: 200,
      flows,
    };
  }
}
