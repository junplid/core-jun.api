import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateVariableContactHumanServiceDTO_I } from "./DTO";
import { UpdateVariableContactHumanServiceRepository_I } from "./Repository";

export class UpdateVariableContactHumanServiceUseCase {
  constructor(
    private repository: UpdateVariableContactHumanServiceRepository_I
  ) {}

  async run(dto: UpdateVariableContactHumanServiceDTO_I) {
    const attendant = await this.repository.fetchAttendantExist({
      userId: dto.userId,
    });

    if (!attendant) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const exists = await this.repository.fetchExist(dto.id);

    if (!exists) {
      throw {
        message: "Variável não encontrada",
        statusCode: 400,
        formErrorMessage: [
          { field: "varId", message: "Variável não encontrada" },
        ],
      };
    }

    const contactAccountId = await this.repository.fetchContactAccount(
      dto.ticketId
    );

    if (!contactAccountId) {
      throw {
        message: "Só é possivel atribuir variável. Contato não encontrado!",
        statusCode: 400,
      };
    }

    await this.repository.updateContactAccountVariableBusiness({
      contactAccountId: contactAccountId,
      id: dto.id,
      value: dto.value,
    });

    return { message: "OK", status: 200, variable: { name: exists } };
  }
}
