import { Request, Response } from "express";
import {
  JoinRouterBodyDTO_I,
  JoinRouterQueryDTO_I,
  JoinRouterParamsDTO_I,
} from "./DTO";
import { JoinRouterUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

const routerAccepted = new Map<string, boolean>();

export const JoinRouterController = (useCase: JoinRouterUseCase) => {
  const execute = async (
    req: Request<
      JoinRouterParamsDTO_I,
      any,
      JoinRouterBodyDTO_I,
      JoinRouterQueryDTO_I
    >,
    res: Response,
  ): Promise<Response> => {
    try {
      const isaccepted = !!routerAccepted.get(req.params.code);
      if (isaccepted) {
        return res.status(200).json({
          message: "Um entregador já está sendo atribuido nessa rota.",
        });
      }

      routerAccepted.set(req.params.code, true);

      const data = await useCase.run({
        ...req.body,
        ...req.query,
        ...req.params,
      });
      routerAccepted.delete(req.params.code);
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
