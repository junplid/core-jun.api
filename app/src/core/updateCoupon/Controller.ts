import { Request, Response } from "express";
import { UpdateCouponBodyDTO_I, UpdateCouponParamsDTO_I } from "./DTO";
import { UpdateCouponUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateCouponController = (useCase: UpdateCouponUseCase) => {
  const execute = async (
    req: Request<UpdateCouponParamsDTO_I, any, UpdateCouponBodyDTO_I>,
    res: Response
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
