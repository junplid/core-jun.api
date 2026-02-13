import { Request, Response } from "express";
import {
  SendTicketMessageBodyDTO_I,
  SendTicketMessageParamsDTO_I,
} from "./DTO";
import { SendTicketMessageUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const SendTicketMessageController = (
  useCase: SendTicketMessageUseCase,
) => {
  const execute = async (
    req: Request<SendTicketMessageParamsDTO_I, any, SendTicketMessageBodyDTO_I>,
    res: Response,
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
