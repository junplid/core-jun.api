import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetSectorsForSelectHumanServiceDTO_I } from "./DTO";
import { GetSectorsForSelectHumanServiceRepository_I } from "./Repository";

export class GetSectorsForSelectHumanServiceUseCase {
  constructor(
    private repository: GetSectorsForSelectHumanServiceRepository_I
  ) {}

  async run(dto: GetSectorsForSelectHumanServiceDTO_I) {
    const fetchBusinessAttendant = await this.repository.fetchAttendant(
      dto.userId
    );
    if (!fetchBusinessAttendant) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }
    const sectors = await this.repository.fetch(
      fetchBusinessAttendant.businessId
    );

    return {
      message: "OK!",
      status: 200,
      sectors,
    };
  }
}
