import { DeleteGeolocationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteGeolocationUseCase {
  constructor() {}

  async run(dto: DeleteGeolocationDTO_I) {
    const exist = await prisma.geolocation.findFirst({ where: dto });
    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Geolocalização não existe ou não esta autorizado`,
        type: "error",
      });
    }

    await prisma.geolocation.delete({ where: { id: dto.id } });

    return { message: "OK!", status: 200 };
  }
}
