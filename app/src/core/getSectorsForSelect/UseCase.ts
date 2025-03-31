import { GetSectorsForSelectRepository_I } from "./Repository";
import { GetSectorsForSelectDTO_I } from "./DTO";

export class GetSectorsForSelectUseCase {
  constructor(private repository: GetSectorsForSelectRepository_I) {}

  async run(dto: GetSectorsForSelectDTO_I) {
    const sectors = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      sectors,
    };
  }
}
