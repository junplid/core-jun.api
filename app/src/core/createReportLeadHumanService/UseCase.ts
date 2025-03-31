import moment from "moment-timezone";
import { CreateReportLeadHumanServiceDTO_I } from "./DTO";
import { CreateReportLeadHumanServiceRepository_I } from "./Repository";

export class CreateReportLeadHumanServiceUseCase {
  constructor(private repository: CreateReportLeadHumanServiceRepository_I) {}

  async run(dto: CreateReportLeadHumanServiceDTO_I) {
    const report = await this.repository.create(dto);

    return {
      message: "OK!",
      status: 200,
      report: report
        ? {
            id: report.id,
            createAt: moment(report.createAt)
              .tz("America/Sao_Paulo")
              .format("DD/MM/YYYY"),
          }
        : null,
    };
  }
}
