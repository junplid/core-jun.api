import { DeleteContactWAOnAccountRepository_I } from "./Repository";
import { DeleteContactWAOnAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteContactWAOnAccountUseCase {
  constructor(private repository: DeleteContactWAOnAccountRepository_I) {}

  async run(dto: DeleteContactWAOnAccountDTO_I) {
    const contactWAOnAccountExist =
      await this.repository.fetchExistContactWAOnAccount({
        contactWAOnAccountId: Number(dto.contactWAOnAccountId),
        accountId: dto.accountId,
      });

    if (!contactWAOnAccountExist) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel encontrar o contato`,
        type: "error",
      });
    }

    await this.repository.deleteContactWAOnAccount({
      contactWAOnAccountId: Number(dto.contactWAOnAccountId),
      accountId: dto.accountId,
    });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
