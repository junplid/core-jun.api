import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTagDTO_I } from "./DTO";

export class CreateTagUseCase {
  constructor() {}

  async run({ businessIds = [], targetId, ...dto }: CreateTagDTO_I) {
    const exist = await prisma.tag.findFirst({
      where: {
        ...dto,
        OR: [
          { TagOnBusiness: { some: { businessId: { in: businessIds } } } },
          { TagOnBusiness: { none: {} } },
        ],
      },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe uma etiqueta com esse nome.`,
      });
    }
    try {
      const { id, TagOnBusiness } = await prisma.tag.create({
        data: {
          ...dto,
          ...(businessIds?.length && {
            TagOnBusiness: {
              createMany: {
                data: businessIds.map((b) => ({
                  businessId: b,
                })),
              },
            },
          }),
        },
        select: {
          id: true,
          TagOnBusiness: {
            select: { Business: { select: { name: true, id: true } } },
          },
        },
      });

      return {
        message: "OK!",
        status: 201,
        tag: {
          id,
          targetId,
          businesses: TagOnBusiness.map((b) => b.Business),
        },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel criar etiqueta.",
        type: "error",
      });
    }
  }
}
