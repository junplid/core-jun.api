import { UpdateRootUserDTO_I } from "./DTO";
import { UpdateRootUserRepository_I } from "./Repository";

export class UpdateRootUserUseCase {
  constructor(private repository: UpdateRootUserRepository_I) {}

  async run({ rootId, ...dto }: UpdateRootUserDTO_I) {
    await this.repository.update({ rootId }, dto);
    return { message: "OK!", status: 200 };
  }
}
