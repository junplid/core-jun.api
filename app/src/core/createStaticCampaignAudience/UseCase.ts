import { CreateStaticCampaignAudienceRepository_I } from "./Repository";
import { CreateStaticCampaignAudienceDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateStaticCampaignAudienceUseCase {
  constructor(private repository: CreateStaticCampaignAudienceRepository_I) {}

  async run({
    listContactsWA,
    ...dto
  }: Omit<CreateStaticCampaignAudienceDTO_I, "number">) {
    let filterListVerifiedContactsWA: number[] = [];

    if (listContactsWA?.length) {
      const listVerifiedContactsWA: (number | null)[] = await Promise.all(
        listContactsWA.map(async (c) => {
          const isTrue =
            await this.repository.checkIfContactWAIsContactWAOnAccount({
              accountId: dto.accountId,
              contactsWAOnAccountId: c,
            });
          if (isTrue) return c;
          return null;
        })
      );

      filterListVerifiedContactsWA = listVerifiedContactsWA.filter(
        (l) => l
      ) as number[];
    }

    const fetchExistAudience = await this.repository.fetchExist({
      accountId: dto.accountId,
      businessId: dto.businessId,
      name: dto.name,
    });

    if (fetchExistAudience) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe público estático com esse nome`,
      });
    }

    const data = await this.repository.create({
      ...dto,
      contactsWAOnAccountIds: filterListVerifiedContactsWA,
    });

    return {
      message: "OK",
      status: 201,
      audience: data,
    };
  }
}
