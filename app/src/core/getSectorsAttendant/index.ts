import { GetSectorsAttendantController } from "./Controller";
import { GetSectorsAttendantUseCase } from "./UseCase";

export const getSectorsAttendantController = GetSectorsAttendantController(
  new GetSectorsAttendantUseCase()
).execute;
