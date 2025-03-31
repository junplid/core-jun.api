import { GetContactWAOnAccountDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetContactWAOnAccountUseCase {
  constructor() {}

  async run(dto: GetContactWAOnAccountDTO_I) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 30;
    const contacts = await prisma.contactsWAOnAccount.findMany({
      orderBy: { id: "desc" },
      where: {
        accountId: dto.accountId,
        ...(dto.campaignAudienceIds?.length && {
          ContactsWAOnAccountOnAudience: {
            some: { audienceId: { in: dto.campaignAudienceIds } },
          },
        }),
      },
      select: {
        name: true,
        updateAt: true,
        id: true,
        ContactsWA: { select: { completeNumber: true, img: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const nextContacts = contacts.map(({ ContactsWA, ...rest }) => ({
      ...rest,
      number: ContactsWA.completeNumber,
      img: ContactsWA.img,
    }));

    return { message: "OK!", status: 200, contacts: nextContacts };
  }
}
