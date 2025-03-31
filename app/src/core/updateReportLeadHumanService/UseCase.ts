import { TypeHumanServiceReportLead } from "@prisma/client";
import { UpdateReportLeadHumanServiceDTO_I } from "./DTO";
import { UpdateReportLeadHumanServiceRepository_I } from "./Repository";

const trans: { [x in TypeHumanServiceReportLead]: string } = {
  note: "Observação",
  pendency: "Dependência",
};

export class UpdateReportLeadHumanServiceUseCase {
  constructor(private repository: UpdateReportLeadHumanServiceRepository_I) {}

  async run(dto: UpdateReportLeadHumanServiceDTO_I) {
    const alreadyExists = await this.repository.alreadyExisting(dto);

    if (!alreadyExists) {
      return {
        message: `${
          trans[dto.type]
        } não encontrado ou você não está autorizado!`,
        statusCode: 400,
      };
    }

    await this.repository.update(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
