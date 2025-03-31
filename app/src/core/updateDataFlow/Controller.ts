import { Request, Response } from "express";
import { UpdateDataFlowBodyDTO_I, UpdateDataFlowParamsDTO_I } from "./DTO";
import { UpdateDataFlowUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateDataFlowController = (useCase: UpdateDataFlowUseCase) => {
  const execute = async (
    req: Request<UpdateDataFlowParamsDTO_I, any, UpdateDataFlowBodyDTO_I>,
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
