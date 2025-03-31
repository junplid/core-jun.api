import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTagHumanServiceDTO_I } from "./DTO";
import { CreateTagHumanServiceRepository_I } from "./Repository";

export class CreateTagHumanServiceUseCase {
  constructor(private repository: CreateTagHumanServiceRepository_I) {}

  async run(dto: CreateTagHumanServiceDTO_I) {
    const attendant = await this.repository.fetchAttendantExist({
      userId: dto.userId,
    });

    if (!attendant) throw { message: "Não autorizado!", status: 401 };

    const tagExist = await this.repository.fetchExists({
      ...attendant,
      name: dto.name,
    });

    if (tagExist) {
      throw {
        message: "",
        statusCode: 400,
        formErrorMessage: [{ field: "name", message: "Tag já existe" }],
      };
    }
    return {
      message: "OK",
      status: 200,
      tag: await this.repository.create({
        ...attendant,
        name: dto.name,
      }),
    };
  }
}
