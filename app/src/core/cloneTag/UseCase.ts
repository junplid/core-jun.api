import { CloneTagDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneTagUseCase {
  constructor() {}

  async run(dto: CloneTagDTO_I) {
    const tagg = await prisma.tag.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        type: true,
        TagOnBusiness: { select: { businessId: true } },
      },
    });

    if (!tagg) {
      throw new ErrorResponse(400).toast({
        title: "Tag não encontrada",
        type: "error",
      });
    }

    const { TagOnBusiness: TagOnBusiness1, ...rest } = tagg;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedTag = await prisma.tag.create({
      data: {
        ...rest,
        name,
        accountId: dto.accountId,
        TagOnBusiness: {
          createMany: {
            data: TagOnBusiness1.map(({ businessId }) => ({ businessId })),
          },
        },
      },
      select: {
        type: true,
        id: true,
        TagOnBusiness: {
          select: {
            Business: { select: { name: true } },
          },
        },
      },
    });

    const { TagOnBusiness, ...restNext } = clonedTag;

    return {
      message: "Tag clonada com sucesso!",
      status: 200,
      tag: {
        ...restNext,
        name,
        business: TagOnBusiness.map((b) => b.Business.name).join(", "),
      },
    };
  }
}
