import { Request, Response } from "express";
import {
  SendPasswordRecoveryEmailBodyDTO_I,
  SendPasswordRecoveryEmailParamsDTO_I,
} from "./DTO";
import { SendPasswordRecoveryEmailUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const SendPasswordRecoveryEmailController = (
  useCase: SendPasswordRecoveryEmailUseCase
) => {
  const execute = async (
    req: Request<
      SendPasswordRecoveryEmailParamsDTO_I,
      any,
      SendPasswordRecoveryEmailBodyDTO_I
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
