import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTagDTO_I } from "./DTO";

export class CreateTagUseCase {
  constructor() {}

  async run({ businessIds = [], ...dto }: CreateTagDTO_I) {
    try {
      const exist = await prisma.tag.findFirst({
        where: {
          ...dto,
          OR: [
            { TagOnBusiness: { some: { businessId: { in: businessIds } } } },
            { TagOnBusiness: { some: { businessId: null as any } } },
          ],
        },
      });

      if (exist) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: `Já existe uma etiqueta com esse nome.`,
        });
      }

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
          targetId: dto.targetId,
          businesses: TagOnBusiness.map((b) => b.Business),
        },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Erro ao criar etiqueta",
        description: "Tente novamente mais tarde.",
        type: "error",
      });
    }
  }
}
