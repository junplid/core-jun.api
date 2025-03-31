import { Request, Response } from "express";
import { DeleteCouponParamsDTO_I } from "./DTO";
import { DeleteCouponUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteCouponController = (useCase: DeleteCouponUseCase) => {
  const execute = async (
    req: Request<DeleteCouponParamsDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.params);
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
