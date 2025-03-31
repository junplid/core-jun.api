import { CloneAudienceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneAudienceUseCase {
  constructor() {}

  async run(dto: CloneAudienceDTO_I) {
    const audiencee = await prisma.audience.findFirst({
      where: { ...dto },
      select: {
        name: true,
        type: true,
        AudienceOnBusiness: { select: { businessId: true } },
        ContactsWAOnAccountOnAudience: {
          select: { contactWAOnAccountId: true },
        },
        TagOnBusinessOnAudience: {
          select: {
            tagOnBusinessId: true,
            TagOnBusiness: { select: { Tag: { select: { name: true } } } },
          },
        },
      },
    });

    if (!audiencee) {
      throw new ErrorResponse(400).toast({
        title: "Público não encontrado",
        type: "error",
      });
    }

    const {
      TagOnBusinessOnAudience: TagOnBusinessOnAudience1,
      AudienceOnBusiness: AudienceOnBusiness1,
      ContactsWAOnAccountOnAudience: ContactsWAOnAccountOnAudience1,
      ...rest
    } = audiencee;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedAudien = await prisma.audience.create({
      data: {
        ...rest,
        name,
        accountId: dto.accountId,
        TagOnBusinessOnAudience: {
          createMany: {
            data: TagOnBusinessOnAudience1.map(({ tagOnBusinessId }) => ({
              tagOnBusinessId,
            })),
          },
        },
        AudienceOnBusiness: {
          createMany: {
            data: AudienceOnBusiness1.map(({ businessId }) => ({ businessId })),
          },
        },
        ContactsWAOnAccountOnAudience: {
          createMany: {
            data: ContactsWAOnAccountOnAudience1.map(
              ({ contactWAOnAccountId }) => ({ contactWAOnAccountId })
            ),
          },
        },
      },
      select: {
        createAt: true,
        type: true,
        id: true,
        _count: { select: { ContactsWAOnAccountOnAudience: true } },
        AudienceOnBusiness: {
          select: { Business: { select: { name: true } } },
        },
      },
    });

    const { _count, AudienceOnBusiness, ...restNext } = clonedAudien;

    return {
      message: "Público clonada com sucesso!",
      status: 200,
      audience: {
        ...restNext,
        tags: TagOnBusinessOnAudience1.map(
          (s) => s.TagOnBusiness.Tag.name
        ).join(", "),
        countContacts: _count.ContactsWAOnAccountOnAudience,
        name,
        business: AudienceOnBusiness.map((b) => b.Business.name).join(", "),
      },
    };
  }
}
