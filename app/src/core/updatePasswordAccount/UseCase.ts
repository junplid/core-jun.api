import { genSalt, hash } from "bcrypt";
import { UpdatePasswordAccountDTO_I } from "./DTO";
import { UpdatePasswordAccountRepository_I } from "./Repository";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdatePasswordAccountUseCase {
  constructor(private repository: UpdatePasswordAccountRepository_I) {}

  async run(dto: UpdatePasswordAccountDTO_I) {
    const alreadyExists = await this.repository.alreadyExisting(dto.accountId);

    if (!alreadyExists) {
      throw new ErrorResponse(401).toast({
        title: `Você não está autorizado`,
        type: "error",
      });
    }

    const salt = await genSalt(8);
    const nPassword = await hash(dto.password, salt);

    await this.repository.update({ ...dto, password: nPassword });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
