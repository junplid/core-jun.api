import { DeleteTagOnBusinessRepository_I } from "./Repository";
import { DeleteTagOnBusinessDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteTagOnBusinessUseCase {
  constructor(private repository: DeleteTagOnBusinessRepository_I) {}

  async run(dto: DeleteTagOnBusinessDTO_I) {
    const exist = await this.repository.fetchExist(dto);

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Tag não encontrada`,
        type: "error",
      });
    }

    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
