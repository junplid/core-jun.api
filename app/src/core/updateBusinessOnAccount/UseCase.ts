import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateBusinessOnAccountDTO_I } from "./DTO";
import { UpdateBusinessOnAccountRepository_I } from "./Repository";

export class UpdateBusinessOnAccountUseCase {
  constructor(private repository: UpdateBusinessOnAccountRepository_I) {}

  async run({ id, accountId, ...dto }: UpdateBusinessOnAccountDTO_I) {
    const exist = await this.repository.fetchExist({
      accountId,
      id,
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Negócio não foi encontrado`,
        type: "error",
      });
    }

    await this.repository.update({ accountId, id }, dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
