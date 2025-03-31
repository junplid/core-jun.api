import { Request, Response } from "express";
import { DeleteCreditCardParamsDTO_I, DeleteCreditCardBodyDTO_I } from "./DTO";
import { DeleteCreditCardUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteCreditCardController = (
  useCase: DeleteCreditCardUseCase
) => {
  const execute = async (
    req: Request<DeleteCreditCardParamsDTO_I, any, DeleteCreditCardBodyDTO_I>,
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
