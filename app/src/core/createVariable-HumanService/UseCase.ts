import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateVariableHumanServiceDTO_I } from "./DTO";
import { CreateVariableHumanServiceRepository_I } from "./Repository";

export class CreateVariableHumanServiceUseCase {
  constructor(private repository: CreateVariableHumanServiceRepository_I) {}

  async run(dto: CreateVariableHumanServiceDTO_I) {
    const attendant = await this.repository.fetchAttendantExist({
      userId: dto.userId,
    });

    if (!attendant) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const exists = await this.repository.fetchExist({
      name: dto.name!,
      businessId: attendant.businessId,
    });

    if (exists) {
      throw {
        message: "Variável já existente",
        statusCode: 400,
        formErrorMessage: [
          { field: "varId", message: "Variável já existente" },
        ],
      };
    }
    const { id } = await this.repository.create({
      ...attendant,
      name: dto.name!,
      userId: dto.userId,
    });

    return { message: "OK", statusCode: 201, variable: { id } };
  }
}
