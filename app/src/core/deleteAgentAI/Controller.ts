import { Request, Response } from "express";
import { DeleteAgentAIBodyDTO_I, DeleteAgentAIParamsDTO_I } from "./DTO";
import { DeleteAgentAIUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteAgentAIController = (useCase: DeleteAgentAIUseCase) => {
  const execute = async (
    req: Request<DeleteAgentAIParamsDTO_I, any, DeleteAgentAIBodyDTO_I>,
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
