import moment from "moment-timezone";
import { GetReportLeadHumanServiceDTO_I } from "./DTO";
import { GetReportLeadHumanServiceRepository_I } from "./Repository";

export class GetReportLeadHumanServiceUseCase {
  constructor(private repository: GetReportLeadHumanServiceRepository_I) {}

  async run(dto: GetReportLeadHumanServiceDTO_I) {
    const result = (await this.repository.fetch(dto)) ?? [];

    return {
      message: "OK!",
      status: 200,
      result: result.map((s) => ({
        ...s,
        createAt: moment(s.createAt)
          .tz("America/Sao_Paulo")
          .format("DD/MM/YYYY"),
      })),
    };
  }
}
