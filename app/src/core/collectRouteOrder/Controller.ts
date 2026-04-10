import { Request, Response } from "express";
import {
  CollectRouteOrderBodyDTO_I,
  CollectRouteOrderQueryDTO_I,
  CollectRouteOrderParamsDTO_I,
} from "./DTO";
import { CollectRouteOrderUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CollectRouteOrderController = (
  useCase: CollectRouteOrderUseCase,
) => {
  const execute = async (
    req: Request<
      CollectRouteOrderParamsDTO_I,
      any,
      CollectRouteOrderBodyDTO_I,
      CollectRouteOrderQueryDTO_I
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
