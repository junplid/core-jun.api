import { Request, Response } from "express";
import {
  GetPaymentIntegrationsForSelectBodyDTO_I,
  GetPaymentIntegrationsForSelectQueryDTO_I,
} from "./DTO";
import { GetPaymentIntegrationsForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetPaymentIntegrationsForSelectController = (
  useCase: GetPaymentIntegrationsForSelectUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetPaymentIntegrationsForSelectBodyDTO_I,
      GetPaymentIntegrationsForSelectQueryDTO_I
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
