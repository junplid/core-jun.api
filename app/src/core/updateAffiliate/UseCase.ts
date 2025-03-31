import { UpdateAffiliateDTO_I } from "./DTO";
import { UpdateAffiliateRepository_I } from "./Repository";

export class UpdateAffiliateUseCase {
  constructor(private repository: UpdateAffiliateRepository_I) {}

  async run({ rootId, number, ...dto }: UpdateAffiliateDTO_I) {
    let contact: number | null = null;
    if (number) {
      const contD = await this.repository.createContactWA({
        completeNumber: number,
      });
      contact = contD.contactWAId;
    }
    await this.repository.update({ ...dto, contactWAId: contact || undefined });
    return { message: "OK!", status: 201 };
  }
}
