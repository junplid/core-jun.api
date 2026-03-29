import { Request, Response } from "express";
import { JoinRouterBodyDTO_I, JoinRouterQueryDTO_I } from "./DTO";
import { JoinRouterUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const JoinRouterController = (useCase: JoinRouterUseCase) => {
  const execute = async (
    req: Request<any, any, JoinRouterBodyDTO_I, JoinRouterQueryDTO_I>,
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
