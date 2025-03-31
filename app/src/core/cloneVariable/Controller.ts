import { Request, Response } from "express";
import { CloneVariableParamsDTO_I, CloneVariableBodyDTO_I } from "./DTO";
import { CloneVariableUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CloneVariableController = (useCase: CloneVariableUseCase) => {
  const execute = async (
    req: Request<CloneVariableParamsDTO_I, any, CloneVariableBodyDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.params,
        ...req.body,
      });
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(error.statusCode ?? 500).json(error.message ?? error);
    }
  };

  return { execute };
};
