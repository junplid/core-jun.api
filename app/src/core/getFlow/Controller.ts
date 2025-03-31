import { Request, Response } from "express";
import { GetFlowBodyDTO_I, GetFlowDTO_I, GetFlowParamsDTO_I } from "./DTO";
import { GetFlowUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFlowController = (useCase: GetFlowUseCase) => {
  const execute = async (
    req: Request<GetFlowParamsDTO_I, any, GetFlowBodyDTO_I>,
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
