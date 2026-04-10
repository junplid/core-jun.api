import { Request, Response } from "express";
import {
  DeliveryCodeRouteOrderBodyDTO_I,
  DeliveryCodeRouteOrderQueryDTO_I,
  DeliveryCodeRouteOrderParamsDTO_I,
} from "./DTO";
import { DeliveryCodeRouteOrderUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeliveryCodeRouteOrderController = (
  useCase: DeliveryCodeRouteOrderUseCase,
) => {
  const execute = async (
    req: Request<
      DeliveryCodeRouteOrderParamsDTO_I,
      any,
      DeliveryCodeRouteOrderBodyDTO_I,
      DeliveryCodeRouteOrderQueryDTO_I
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
