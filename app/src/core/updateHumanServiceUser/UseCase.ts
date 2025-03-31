import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateHumanServiceUserDTO_I } from "./DTO";
import { UpdateHumanServiceUserRepository_I } from "./Repository";

export class UpdateHumanServiceUserUseCase {
  constructor(private repository: UpdateHumanServiceUserRepository_I) {}

  async run(dto: UpdateHumanServiceUserDTO_I) {
    const alreadyExists = await this.repository.fetchExist({
      userId: dto.userId,
    });

    if (!alreadyExists) {
      throw new ErrorResponse(400).toast({
        title: `Usuario não foi encontrado`,
        type: "error",
      });
    }

    await this.repository.update({
      type: alreadyExists,
      ...dto,
    });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
