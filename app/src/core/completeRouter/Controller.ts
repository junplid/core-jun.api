import { Request, Response } from "express";
import {
  CompleteRouterBodyDTO_I,
  CompleteRouterQueryDTO_I,
  CompleteRouterParamsDTO_I,
} from "./DTO";
import { CompleteRouterUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CompleteRouterController = (useCase: CompleteRouterUseCase) => {
  const execute = async (
    req: Request<
      CompleteRouterParamsDTO_I,
      any,
      CompleteRouterBodyDTO_I,
      CompleteRouterQueryDTO_I
    >,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
        ...req.params,
      });
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
