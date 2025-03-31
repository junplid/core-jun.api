import { GetFlowsDTO_I } from "./DTO";
import { GetFlowsRepository_I } from "./Repository";

export class GetFlowsUseCase {
  constructor(private repository: GetFlowsRepository_I) {}

  async run(dto: GetFlowsDTO_I) {
    const flows = await this.repository.fetch(dto);
    const nextFlows = await Promise.all(
      flows.map(async (flow) => {
        const dataBusiness = await this.repository.fetchBusiness({
          businessIds: flow.businessIds,
        });
        return {
          name: flow.name,
          id: flow._id,
          type: flow.type,
          business: dataBusiness.join(", "),
        };
      })
    );

    return {
      message: "OK!",
      status: 201,
      flows: nextFlows,
    };
  }
}
