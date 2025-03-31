import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTagContactHumanServiceDTO_I } from "./DTO";
import { CreateTagContactHumanServiceRepository_I } from "./Repository";

export class CreateTagContactHumanServiceUseCase {
  constructor(private repository: CreateTagContactHumanServiceRepository_I) {}

  async run(dto: CreateTagContactHumanServiceDTO_I) {
    const attendant = await this.repository.fetchAttendantExist({
      userId: dto.userId,
    });

    if (!attendant) throw { message: "Não autorizado!", status: 401 };

    const contactAccountId = await this.repository.fetchContactAccount(
      dto.ticketId
    );

    if (!contactAccountId) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel atribuir tag. Contato não encontrado`,
        type: "error",
      });
    }

    const tagsFail: number[] = [];

    await Promise.all(
      dto.list.map(async (id) => {
        const tag = await this.repository.fetchTagOnBusinessId({
          businessId: attendant.businessId,
          id,
        });

        if (!tag) return tagsFail.push(id);

        const existtagonaccount =
          await this.repository.existTagOnContactAccount({
            contactAccountId: contactAccountId,
            tagBusinessId: tag.tagBusinessId,
          });

        if (existtagonaccount) return;
        await this.repository.addTagOnContactAccount({
          contactAccountId: contactAccountId,
          tagBusinessId: tag.tagBusinessId,
        });
      })
    );

    if (tagsFail.length === dto.list.length) {
      throw new ErrorResponse(400).input({
        path: "list",
        text: `Não foi possivel atribuir tags. Nenhuma foi encontrada`,
      });
    }

    return { message: "OK", status: 200, tagsFail: tagsFail.length };
  }
}
