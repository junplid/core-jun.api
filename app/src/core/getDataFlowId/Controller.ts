import { Request, Response } from "express";
import { GetDataFlowIdBodyDTO_I, GetDataFlowIdParamsDTO_I } from "./DTO";
import { GetDataFlowIdUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetDataFlowIdController = (useCase: GetDataFlowIdUseCase) => {
  const execute = async (
    req: Request<GetDataFlowIdParamsDTO_I, any, GetDataFlowIdBodyDTO_I>,
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
