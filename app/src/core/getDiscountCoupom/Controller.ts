import { Request, Response } from "express";
import {
  GetDiscountCoupomParamsDTO_I,
  GetDiscountCoupomBodyDTO_I,
  GetDiscountCoupomQueryDTO_I,
} from "./DTO";
import { GetDiscountCoupomUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetDiscountCoupomController = (
  useCase: GetDiscountCoupomUseCase
) => {
  const execute = async (
    req: Request<
      GetDiscountCoupomParamsDTO_I,
      any,
      GetDiscountCoupomBodyDTO_I,
      GetDiscountCoupomQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.params,
        ...req.query,
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
