import { Request, Response } from "express";
import { ReturnTicketBodyDTO_I, ReturnTicketParamsDTO_I } from "./DTO";
import { ReturnTicketUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const ReturnTicketController = (useCase: ReturnTicketUseCase) => {
  const execute = async (
    req: Request<ReturnTicketParamsDTO_I, any, ReturnTicketBodyDTO_I>,
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
