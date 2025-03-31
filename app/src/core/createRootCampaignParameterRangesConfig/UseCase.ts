import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateRootCampaignParameterRangesConfigDTO_I } from "./DTO";
import { CreateRootCampaignParameterRangesConfigRepository_I } from "./Repository";

export class CreateRootCampaignParameterRangesConfigUseCase {
  constructor(
    private repository: CreateRootCampaignParameterRangesConfigRepository_I
  ) {}

  async run({ rootId, ...dto }: CreateRootCampaignParameterRangesConfigDTO_I) {
    const isAlreadyExist =
      await this.repository.fetchExistParameterWithThisNameAtSequence({
        name: dto.name,
        sequence: dto.sequence,
      });

    if (isAlreadyExist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Parâmetro já existe`,
      });
    }

    const { rootCampaignParameterRangesConfigId } =
      await this.repository.create(dto);

    return {
      message: "Intervalo criado com sucesso!",
      status: 201,
      rootCampaignParameterRangesConfigId,
    };
  }
}
