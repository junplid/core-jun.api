import { UpdateMenuOnlineOperatingDaysController } from "./Controller";
import { UpdateMenuOnlineOperatingDaysUseCase } from "./UseCase";

export const updateMenuOnlineOperatingDaysController =
  UpdateMenuOnlineOperatingDaysController(
    new UpdateMenuOnlineOperatingDaysUseCase(),
  ).execute;
