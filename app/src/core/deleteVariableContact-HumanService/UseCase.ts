import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteVariableContactHumanServiceDTO_I } from "./DTO";
import { DeleteVariableContactHumanServiceRepository_I } from "./Repository";

export class DeleteVariableContactHumanServiceUseCase {
  constructor(
    private repository: DeleteVariableContactHumanServiceRepository_I
  ) {}

  async run(dto: DeleteVariableContactHumanServiceDTO_I) {
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

    const contactsVariableBusinessId =
      await this.repository.fetchContactVariableBusinessId({
        ticketId: dto.ticketId,
        variableId: dto.id,
      });

    if (!contactsVariableBusinessId) {
      throw {
        message: "Valor da variável não encontrada!",
        statusCode: 400,
      };
    }

    await this.repository.delete({ contactsVariableBusinessId });

    return { message: "OK", status: 200 };
  }
}
