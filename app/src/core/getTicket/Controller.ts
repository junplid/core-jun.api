import { Request, Response } from "express";
import { GetTicketBodyDTO_I, GetTicketParamsDTO_I } from "./DTO";
import { GetTicketUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTicketController = (useCase: GetTicketUseCase) => {
  const execute = async (
    req: Request<GetTicketParamsDTO_I, any, GetTicketBodyDTO_I>,
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
