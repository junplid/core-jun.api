import { Request, Response } from "express";
import {
  DeletePaymentIntegrationBodyDTO_I,
  DeletePaymentIntegrationParamsDTO_I,
} from "./DTO";
import { DeletePaymentIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeletePaymentIntegrationController = (
  useCase: DeletePaymentIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      DeletePaymentIntegrationParamsDTO_I,
      any,
      DeletePaymentIntegrationBodyDTO_I
    >,
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
