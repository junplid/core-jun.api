import { Request, Response } from "express";
import { UpdateFlowBodyDTO_I, UpdateFlowParamsDTO_I } from "./DTO";
import { UpdateFlowUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateFlowController = (useCase: UpdateFlowUseCase) => {
  const execute = async (
    req: Request<UpdateFlowParamsDTO_I, any, UpdateFlowBodyDTO_I>,
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
