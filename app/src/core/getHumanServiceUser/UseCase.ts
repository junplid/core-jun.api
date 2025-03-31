import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetHumanServiceUserDTO_I } from "./DTO";
import { GetHumanServiceUserRepository_I } from "./Repository";

export class GetHumanServiceUserUseCase {
  constructor(private repository: GetHumanServiceUserRepository_I) {}

  async run(dto: GetHumanServiceUserDTO_I) {
    const userAtt = await this.repository.findSectorsAttendants(dto);

    if (!userAtt) {
      const userSup = await this.repository.findSupervisors(dto);

      if (!userSup) {
        throw new ErrorResponse(401).toast({
          title: ` Não autorizado`,
          type: "error",
        });
      }

      return {
        message: "OK",
        statusCode: 200,
        user: { ...userSup, type: "supervisor" },
      };
    }

    if (!userAtt?.sector) {
      throw new ErrorResponse(401).toast({
        title: ` Não autorizado`,
        type: "error",
      });
    }

    return {
      message: "OK",
      status: 200,
      user: { ...userAtt, type: "sectorAttendant" },
    };
  }
}
