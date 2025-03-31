import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteReportLeadHumanServiceDTO_I } from "./DTO";
import { DeleteReportLeadHumanServiceRepository_I } from "./Repository";

export class DeleteReportLeadHumanServiceUseCase {
  constructor(private repository: DeleteReportLeadHumanServiceRepository_I) {}

  async run(dto: DeleteReportLeadHumanServiceDTO_I) {
    const dd = await this.repository.delete(dto);

    if (!dd) {
      throw new ErrorResponse(400).toast({
        title: `Item não existe ou não esta autorizado`,
        type: "error",
      });
    }

    return {
      message: "OK!",
      status: 200,
    };
  }
}
