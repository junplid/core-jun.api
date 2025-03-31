import { CreateInteractionsCampaignAudienceRepository_I } from "./Repository";
import { CreateInteractionsCampaignAudienceDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateInteractionsCampaignAudienceUseCase {
  constructor(
    private repository: CreateInteractionsCampaignAudienceRepository_I
  ) {}

  async run(dto: Omit<CreateInteractionsCampaignAudienceDTO_I, "number">) {
    try {
      const fetchContacts = await this.repository.fetch({
        filters: dto.filters,
        accountId: dto.accountId,
        sources: dto.sources,
      });

      if (!fetchContacts.length) {
        console.log("NÃO A CONTATOS");
        return;
      }

      const audience = await this.repository.create({
        contacts: fetchContacts,
        name: dto.name,
        tagOnBusinessId: dto.tagOnBusinessId,
        businessIds: dto.businessIds,
        accountId: dto.accountId,
      });

      return {
        message: "OK",
        status: 200,
        audience,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error para ao tentar criar público`,
        type: "error",
      });
    }
  }
}
