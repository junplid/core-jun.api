import { UpdateSectorsAttendantController } from "./Controller";
import { UpdateSectorsAttendantUseCase } from "./UseCase";

export const updateSectorsAttendantController =
  UpdateSectorsAttendantController(new UpdateSectorsAttendantUseCase()).execute;
