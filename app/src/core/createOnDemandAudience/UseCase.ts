import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateOnDemandAudienceDTO_I } from "./DTO";
import { CreateOnDemandAudienceRepository_I } from "./Repository";

export class CreateOnDemandAudienceUseCase {
  constructor(private repository: CreateOnDemandAudienceRepository_I) {}

  async run(dto: Omit<CreateOnDemandAudienceDTO_I, "number">) {
    const fetchExistAudience = await this.repository.fetchExist({
      accountId: dto.accountId,
      businessIds: dto.businessIds,
      name: dto.name,
    });

    if (fetchExistAudience) {
      throw new ErrorResponse(400).toast({
        title: `Já existe público com esse nome`,
        type: "error",
      });
    }

    const data = await this.repository.create(dto);

    return {
      message: "OK",
      status: 201,
      audience: { ...data },
    };
  }
}
