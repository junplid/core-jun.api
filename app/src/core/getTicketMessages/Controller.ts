import { Request, Response } from "express";
import {
  GetTicketMessagesBodyDTO_I,
  GetTicketMessagesParamsDTO_I,
  GetTicketMessagesQueryDTO_I,
} from "./DTO";
import { GetTicketMessagesUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTicketMessagesController = (
  useCase: GetTicketMessagesUseCase
) => {
  const execute = async (
    req: Request<
      GetTicketMessagesParamsDTO_I,
      any,
      GetTicketMessagesBodyDTO_I,
      GetTicketMessagesQueryDTO_I
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
