import { Request, Response } from "express";
import {
  UpdateSectorsAttendantBodyDTO_I,
  UpdateSectorsAttendantParamsDTO_I,
  UpdateSectorsAttendantQueryDTO_I,
} from "./DTO";
import { UpdateSectorsAttendantUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateSectorsAttendantController = (
  useCase: UpdateSectorsAttendantUseCase
) => {
  const execute = async (
    req: Request<
      UpdateSectorsAttendantParamsDTO_I,
      any,
      UpdateSectorsAttendantBodyDTO_I,
      UpdateSectorsAttendantQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
        ...req.params,
      });
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
