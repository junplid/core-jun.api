import { Request, Response } from "express";
import {
  UpdateOrderBodyDTO_I,
  UpdateOrderParamsDTO_I,
  UpdateOrderQueryDTO_I,
} from "./DTO";
import { UpdateOrderUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateOrderController = (useCase: UpdateOrderUseCase) => {
  const execute = async (
    req: Request<
      UpdateOrderParamsDTO_I,
      any,
      UpdateOrderBodyDTO_I,
      UpdateOrderQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
      const data = await useCase.run(dto);
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
