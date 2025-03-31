import { Request, Response } from "express";
import {
  UpdateSupervisorBodyDTO_I,
  UpdateSupervisorParamsDTO_I,
  UpdateSupervisorQueryDTO_I,
} from "./DTO";
import { UpdateSupervisorUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateSupervisorController = (
  useCase: UpdateSupervisorUseCase
) => {
  const execute = async (
    req: Request<
      UpdateSupervisorParamsDTO_I,
      any,
      UpdateSupervisorBodyDTO_I,
      UpdateSupervisorQueryDTO_I
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
