import { Request, Response } from "express";
import {
  GetPaymentIntegrationsBodyDTO_I,
  GetPaymentIntegrationsQueryDTO_I,
} from "./DTO";
import { GetPaymentIntegrationsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetPaymentIntegrationsController = (
  useCase: GetPaymentIntegrationsUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetPaymentIntegrationsBodyDTO_I,
      GetPaymentIntegrationsQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.query });
      return res.status(200).json(data);
    } catch (error: any) {
      console.log(error);
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
