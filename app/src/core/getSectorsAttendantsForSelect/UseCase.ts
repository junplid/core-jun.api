import { GetSectorsAttendantsForSelectRepository_I } from "./Repository";
import { GetSectorsAttendantsForSelectDTO_I } from "./DTO";

export class GetSectorsAttendantsForSelectUseCase {
  constructor(private repository: GetSectorsAttendantsForSelectRepository_I) {}

  async run(dto: GetSectorsAttendantsForSelectDTO_I) {
    const sectorsAttendants = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      sectorsAttendants,
    };
  }
}
