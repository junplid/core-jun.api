import { Request, Response } from "express";
import { PrintTableOrderBodyDTO_I, PrintTableOrderParamsDTO_I } from "./DTO";
import { PrintTableOrderUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const PrintTableOrderController = (useCase: PrintTableOrderUseCase) => {
  const execute = async (
    req: Request<PrintTableOrderParamsDTO_I, any, PrintTableOrderBodyDTO_I>,
    res: Response,
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
