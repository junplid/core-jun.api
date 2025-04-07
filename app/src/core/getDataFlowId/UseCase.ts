import { GetDataFlowIdRepository_I } from "./Repository";
import { GetDataFlowIdDTO_I } from "./DTO";

export class GetDataFlowIdUseCase {
  constructor(private repository: GetDataFlowIdRepository_I) {}

  async run(dto: GetDataFlowIdDTO_I) {
    const data = await this.repository.fetch({
      _id: dto.id,
      accountId: dto.accountId,
    });

    return { message: "OK!", status: 200, flow: data };
  }
}
