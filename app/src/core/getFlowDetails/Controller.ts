import { Request, Response } from "express";
import {
  GetFlowDetailsBodyDTO_I,
  GetFlowDetailsDTO_I,
  GetFlowDetailsParamsDTO_I,
} from "./DTO";
import { GetFlowDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFlowDetailsController = (useCase: GetFlowDetailsUseCase) => {
  const execute = async (
    req: Request<GetFlowDetailsParamsDTO_I, any, GetFlowDetailsBodyDTO_I>,
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
