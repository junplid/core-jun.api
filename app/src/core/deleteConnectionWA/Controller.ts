import { Request, Response } from "express";
import {
  DeleteConnectionWABodyDTO_I,
  DeleteConnectionWAParamsDTO_I,
} from "./DTO";
import { DeleteConnectionWAUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteConnectionWAController = (
  useCase: DeleteConnectionWAUseCase
) => {
  const execute = async (
    req: Request<
      DeleteConnectionWAParamsDTO_I,
      any,
      DeleteConnectionWABodyDTO_I
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
