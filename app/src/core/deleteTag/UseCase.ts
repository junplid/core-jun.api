import { DeleteTagDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteTagUseCase {
  constructor() {}

  async run(dto: DeleteTagDTO_I) {
    const exist = await prisma.tag.count({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Tag não encontrada`,
        type: "error",
      });
    }

    await prisma.tag.delete({ where: { id: dto.id } });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
