import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetSectorsAttendantsForSelectHumanServiceDTO_I } from "./DTO";
import { GetSectorsAttendantsForSelectHumanServiceRepository_I } from "./Repository";

export class GetSectorsAttendantsForSelectHumanServiceUseCase {
  constructor(
    private repository: GetSectorsAttendantsForSelectHumanServiceRepository_I
  ) {}

  async run(dto: GetSectorsAttendantsForSelectHumanServiceDTO_I) {
    const userAttendent = await this.repository.getAttendent(dto.userId);

    if (!userAttendent) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const sectorsAttendants = await this.repository.fetch({
      sectorsId: dto.sectorId,
      businessId: userAttendent.businessId,
    });

    return {
      message: "OK!",
      status: 200,
      sectorsAttendants,
    };
  }
}
