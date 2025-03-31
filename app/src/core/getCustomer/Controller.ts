import { Request, Response } from "express";
import { GetCustomerDTO_I } from "./DTO";
import { GetCustomerUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetCustomerController = (useCase: GetCustomerUseCase) => {
  const execute = async (
    req: Request<any, any, GetCustomerDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
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
