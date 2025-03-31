import { Request, Response } from "express";
import { GetVariableBodyDTO_I, GetVariableParamsDTO_I } from "./DTO";
import { GetVariableUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetVariableController = (useCase: GetVariableUseCase) => {
  const execute = async (
    req: Request<GetVariableParamsDTO_I, any, GetVariableBodyDTO_I>,
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
