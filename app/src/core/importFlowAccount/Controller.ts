import { Request, Response } from "express";
import { ImportFlowAccountDTO_I } from "./DTO";
import { ImportFlowAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const ImportFlowAccountController = (
  useCase: ImportFlowAccountUseCase,
) => {
  const execute = async (
    req: Request<any, any, ImportFlowAccountDTO_I>,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
      return res.status(200).json(data);
    } catch (error: any) {
      console.log("2", error);
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
