import { GetSectorsRepository_I } from "./Repository";
import { GetSectorsDTO_I } from "./DTO";

export class GetSectorsUseCase {
  constructor(private repository: GetSectorsRepository_I) {}

  async run(dto: GetSectorsDTO_I) {
    const sectors = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      sectors,
    };
  }
}
