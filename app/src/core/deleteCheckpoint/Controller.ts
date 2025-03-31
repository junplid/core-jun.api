import { Request, Response } from "express";
import { DeleteCheckpointBodyDTO_I, DeleteCheckpointParamsDTO_I } from "./DTO";
import { DeleteCheckpointUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteCheckpointController = (
  useCase: DeleteCheckpointUseCase
) => {
  const execute = async (
    req: Request<DeleteCheckpointParamsDTO_I, any, DeleteCheckpointBodyDTO_I>,
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
