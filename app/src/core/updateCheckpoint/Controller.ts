import { Request, Response } from "express";
import {
  UpdateCheckpointBodyDTO_I,
  UpdateCheckpointParamsDTO_I,
  UpdateCheckpointQueryDTO_I,
} from "./DTO";
import { UpdateCheckpointUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateCheckpointController = (
  useCase: UpdateCheckpointUseCase
) => {
  const execute = async (
    req: Request<
      UpdateCheckpointParamsDTO_I,
      any,
      UpdateCheckpointBodyDTO_I,
      UpdateCheckpointQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
      const data = await useCase.run(dto);
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
