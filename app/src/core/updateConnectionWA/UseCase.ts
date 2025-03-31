import { UpdateConnectionWADTO_I } from "./DTO";
import { UpdateConnectionWARepository_I } from "./Repository";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateConnectionWAUseCase {
  constructor(private repository: UpdateConnectionWARepository_I) {}

  async run({ accountId, id, ...dto }: UpdateConnectionWADTO_I) {
    const exist = await this.repository.fetchExist({ accountId, id });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Conexão não encontrada`,
        type: "error",
      });
    }

    try {
      const { business } = await this.repository.update({ accountId, id }, dto);
      return { message: "OK!", status: 200, business };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar conexão`,
        type: "error",
      });
    }
  }
}
