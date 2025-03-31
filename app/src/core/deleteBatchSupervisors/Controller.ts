import { Request, Response } from "express";
import {
  DeleteBatchSupervisorBodyDTO_I,
  DeleteBatchSupervisorParamsDTO_I,
} from "./DTO";
import { DeleteBatchSupervisorUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteBatchSupervisorController = (
  useCase: DeleteBatchSupervisorUseCase
) => {
  const execute = async (
    req: Request<
      DeleteBatchSupervisorParamsDTO_I,
      any,
      DeleteBatchSupervisorBodyDTO_I
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
