import { UpdateRootCampaignParameterRangesConfigDTO_I } from "./DTO";
import { UpdateRootCampaignParameterRangesConfigRepository_I } from "./Repository";

export class UpdateRootCampaignParameterRangesConfigUseCase {
  constructor(
    private repository: UpdateRootCampaignParameterRangesConfigRepository_I
  ) {}

  async run({ rootId, ...dto }: UpdateRootCampaignParameterRangesConfigDTO_I) {
    let isAlreadyExist = null;

    if (dto.sequence) {
      isAlreadyExist =
        await this.repository.fetchExistParameterWithThisNameAtSequence({
          id: dto.id,
          sequence: dto.sequence,
        });
    }

    if (isAlreadyExist) {
      return {
        message: "Nome já existe!",
        status: 200,
      };
    }

    await this.repository.update(dto);

    return {
      message: "Intervalo atualizado com sucesso!",
      status: 200,
    };
  }
}
