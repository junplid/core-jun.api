import { GenerateMenuOnlineReportController } from "./Controller";
import { GenerateMenuOnlineReportUseCase } from "./UseCase";

export const generateMenuOnlineReportController =
  GenerateMenuOnlineReportController(
    new GenerateMenuOnlineReportUseCase(),
  ).execute;
