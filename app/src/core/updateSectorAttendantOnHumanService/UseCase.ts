import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateSectorAttendantOnHumanServiceDTO_I } from "./DTO";
import { UpdateSectorAttendantOnHumanServiceRepository_I } from "./Repository";

export class UpdateSectorAttendantOnHumanServiceUseCase {
  constructor(
    private repository: UpdateSectorAttendantOnHumanServiceRepository_I
  ) {}

  async run(dto: UpdateSectorAttendantOnHumanServiceDTO_I) {
    const alreadyExists = await this.repository.alreadyExisting({
      userId: dto.userId,
    });

    if (!alreadyExists) {
      throw new ErrorResponse(400).toast({
        title: `Supervisor não encontrado`,
        type: "error",
      });
    }

    await this.repository.update(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
