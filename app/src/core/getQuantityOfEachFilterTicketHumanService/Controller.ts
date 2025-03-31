import { Request, Response } from "express";
import { GetQuantityOfEachFilterTicketHumanServiceDTO_I } from "./DTO";
import { GetQuantityOfEachFilterTicketHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetQuantityOfEachFilterTicketHumanServiceController = (
  useCase: GetQuantityOfEachFilterTicketHumanServiceUseCase
) => {
  const execute = async (
    req: Request<any, any, GetQuantityOfEachFilterTicketHumanServiceDTO_I>,
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
