import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateTagDTO_I } from "./DTO";

export class UpdateTagUseCase {
  constructor() {}

  async run({ accountId, id, businessIds, ...dto }: UpdateTagDTO_I) {
    const exist = await prisma.tag.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Tag não encontrada!`,
        type: "error",
      });
    }

    try {
      const { TagOnBusiness } = await prisma.tag.update({
        where: { id },
        data: {
          ...dto,
          ...(businessIds?.length && {
            TagOnBusiness: {
              deleteMany: { tagId: id },
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
          }),
        },
        select: {
          TagOnBusiness: { select: { Business: { select: { name: true } } } },
        },
      });

      return {
        message: "OK!",
        status: 200,
        tag: { business: TagOnBusiness.map((s) => s.Business.name).join(", ") },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar tag!`,
        type: "error",
      });
    }
  }
}
