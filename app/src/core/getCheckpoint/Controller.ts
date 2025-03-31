import { Request, Response } from "express";
import { GetCheckpointBodyDTO_I, GetCheckpointParamsDTO_I } from "./DTO";
import { GetCheckpointUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCheckpointController = (useCase: GetCheckpointUseCase) => {
  const execute = async (
    req: Request<GetCheckpointParamsDTO_I, any, GetCheckpointBodyDTO_I>,
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
