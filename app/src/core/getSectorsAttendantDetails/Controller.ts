import { Request, Response } from "express";
import {
  GetSectorsAttendantDetailsBodyDTO_I,
  GetSectorsAttendantDetailsParamsDTO_I,
} from "./DTO";
import { GetSectorsAttendantDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetSectorsAttendantDetailsController = (
  useCase: GetSectorsAttendantDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetSectorsAttendantDetailsParamsDTO_I,
      any,
      GetSectorsAttendantDetailsBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.params });
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
