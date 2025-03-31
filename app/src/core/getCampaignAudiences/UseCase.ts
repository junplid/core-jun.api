import { GetCampaignAudiencesRepository_I } from "./Repository";
import { GetCampaignAudiencesDTO_I } from "./DTO";

export class GetCampaignAudiencesUseCase {
  constructor(private repository: GetCampaignAudiencesRepository_I) {}

  async run(dto: GetCampaignAudiencesDTO_I) {
    const campaignAudience = await this.repository.get(dto);

    const nextCampaignAudience = campaignAudience.map(
      ({ _count, AudienceOnBusiness, TagOnBusinessOnAudience, ...res }) => ({
        countContacts: _count.ContactsWAOnAccountOnAudience,
        tags: TagOnBusinessOnAudience.map((t) => t.TagOnBusiness.Tag.name).join(
          ", "
        ),
        business: AudienceOnBusiness.map((b) => b.Business.name).join(", "),
        ...res,
      })
    );

    return {
      message: "OK!",
      status: 200,
      campaignsAudiences: nextCampaignAudience,
    };
  }
}
