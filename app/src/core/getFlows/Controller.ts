import { Request, Response } from "express";
import { GetFlowsDTO_I } from "./DTO";
import { GetFlowsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFlowsController = (useCase: GetFlowsUseCase) => {
  const execute = async (
    req: Request<any, any, GetFlowsDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
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
