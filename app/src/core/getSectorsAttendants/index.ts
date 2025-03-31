import { GetSectorsAttendantsController } from "./Controller";
import { GetSectorsAttendantsUseCase } from "./UseCase";

export const getSectorsAttendantsController = GetSectorsAttendantsController(
  new GetSectorsAttendantsUseCase()
).execute;
