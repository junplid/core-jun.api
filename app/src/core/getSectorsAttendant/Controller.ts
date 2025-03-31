import { Request, Response } from "express";
import {
  GetSectorsAttendantBodyDTO_I,
  GetSectorsAttendantParamsDTO_I,
} from "./DTO";
import { GetSectorsAttendantUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetSectorsAttendantController = (
  useCase: GetSectorsAttendantUseCase
) => {
  const execute = async (
    req: Request<
      GetSectorsAttendantParamsDTO_I,
      any,
      GetSectorsAttendantBodyDTO_I
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
