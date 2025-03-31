import { Request, Response } from "express";
import { CreateCloneFlowBodyDTO_I, CreateCloneFlowParamsDTO_I } from "./DTO";
import { CreateCloneFlowUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneFlowController = (useCase: CreateCloneFlowUseCase) => {
  const execute = async (
    req: Request<CreateCloneFlowParamsDTO_I, any, CreateCloneFlowBodyDTO_I>,
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
