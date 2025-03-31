import { GetSectorsAttendantDetailsController } from "./Controller";
import { GetSectorsAttendantDetailsUseCase } from "./UseCase";

export const getSectorsAttendantDetailsController =
  GetSectorsAttendantDetailsController(
    new GetSectorsAttendantDetailsUseCase()
  ).execute;
