import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetSubAccountDetailsDTO_I } from "./DTO";

export class GetSubAccountDetailsUseCase {
  constructor() {}

  async run(dto: GetSubAccountDetailsDTO_I) {
    const userFind = await prisma.subAccount.findUnique({
      where: dto,
      select: {
        name: true,
        status: true,
        email: true,
        createAt: true,
        updateAt: true,
      },
    });

    if (!userFind) {
      throw new ErrorResponse(400).toast({
        title: `Subconta não foi encontrado!`,
        type: "error",
      });
    }

    return {
      message: "OK!",
      status: 200,
      user: {
        id: dto.id,
        ...userFind,
        status: Number(userFind.status),
      },
    };
  }
}
