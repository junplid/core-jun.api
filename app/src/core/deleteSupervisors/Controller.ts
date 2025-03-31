import { Request, Response } from "express";
import { DeleteSupervisorBodyDTO_I, DeleteSupervisorParamsDTO_I } from "./DTO";
import { DeleteSupervisorUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteSupervisorController = (
  useCase: DeleteSupervisorUseCase
) => {
  const execute = async (
    req: Request<DeleteSupervisorParamsDTO_I, any, DeleteSupervisorBodyDTO_I>,
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
