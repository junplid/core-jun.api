import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteTagContactHumanServiceDTO_I } from "./DTO";
import { DeleteTagContactHumanServiceRepository_I } from "./Repository";

export class DeleteTagContactHumanServiceUseCase {
  constructor(private repository: DeleteTagContactHumanServiceRepository_I) {}

  async run(dto: DeleteTagContactHumanServiceDTO_I) {
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
        message: "",
        statusCode: 400,
        formErrorMessage: [{ field: "varId", message: "Tag não encontrada" }],
      };
    }

    const contactsTagBusinessId =
      await this.repository.fetchContactTagBusinessId({
        ticketId: dto.ticketId,
        tagId: dto.id,
      });

    if (!contactsTagBusinessId) {
      throw { message: "Tag não esta anexada a este lead!", statusCode: 400 };
    }

    await this.repository.delete({ contactsTagBusinessId });

    return { message: "OK", status: 200 };
  }
}
