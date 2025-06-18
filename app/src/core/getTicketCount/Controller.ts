import { Request, Response } from "express";
import {
  GetTicketCountBodyDTO_I,
  GetTicketCountQueryDTO_I,
  GetTicketCountParamsDTO_I,
} from "./DTO";
import { GetTicketCountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTicketCountController = (useCase: GetTicketCountUseCase) => {
  const execute = async (
    req: Request<
      GetTicketCountParamsDTO_I,
      any,
      GetTicketCountBodyDTO_I,
      GetTicketCountQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
        ...req.params,
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
