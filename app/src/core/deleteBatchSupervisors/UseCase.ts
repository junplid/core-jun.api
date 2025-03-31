import { DeleteBatchSupervisorRepository_I } from "./Repository";
import { DeleteBatchSupervisorDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteBatchSupervisorUseCase {
  constructor(private repository: DeleteBatchSupervisorRepository_I) {}

  async run(dto: DeleteBatchSupervisorDTO_I) {
    const dataError = await Promise.all(
      dto.batch.map(async (id) => {
        const exist = await this.repository.fetchExist({
          accountId: dto.accountId,
          id,
        });
        if (!exist) return false;

        await this.repository.delete({
          accountId: dto.accountId,
          id,
        });
        return true;
      })
    );

    const countErr = dataError.filter((e) => !e).length;

    if (dto.batch.length === countErr) {
      throw new ErrorResponse(401).toast({
        title: `Os supervisores equivalentes não existem ou você não está autorizado!`,
        type: "error",
      });
    }

    if (countErr) {
      throw new ErrorResponse(400).toast({
        title: `Alguns supervisores não existem ou você não estava autorizado!`,
        type: "error",
      });
    }

    return {
      message: "OK!",
      status: 200,
    };
  }
}
