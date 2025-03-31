import { DeleteSectorAttendantRepository_I } from "./Repository";
import { DeleteSectorAttendantDTO_I } from "./DTO";

export class DeleteSectorAttendantUseCase {
  constructor(private repository: DeleteSectorAttendantRepository_I) {}

  async run(dto: DeleteSectorAttendantDTO_I) {
    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
