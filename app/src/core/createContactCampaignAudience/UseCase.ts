import { CreateContactCampaignAudienceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class CreateContactCampaignAudienceUseCase {
  constructor() {}

  async run({
    listContactsWA,
    ...dto
  }: Omit<CreateContactCampaignAudienceDTO_I, "number">) {
    let createdCount = 0;
    let idContact: null | number = null;
    for await (const contact of listContactsWA) {
      const existContact = !!(await prisma.contactsWAOnAccount.findFirst({
        where: { accountId: dto.accountId, id: contact },
        select: { id: true },
      }));

      if (existContact) {
        const exist = await prisma.contactsWAOnAccountOnAudience.findFirst({
          where: { contactWAOnAccountId: contact, audienceId: dto.id },
        });

        if (!exist) {
          await prisma.contactsWAOnAccountOnAudience.create({
            data: { contactWAOnAccountId: contact, audienceId: dto.id },
            select: { id: true },
          });
          createdCount++;
          if (!idContact) idContact = contact;
        }
      }
    }

    return {
      message: "OK",
      status: 201,
      audience: { createdCount, idContact },
    };
  }
}
