import { Request, Response } from "express";
import {
  GetConnectionsWARootForSelectBodyDTO_I,
  GetConnectionsWARootForSelectQueryDTO_I,
} from "./DTO";
import { GetConnectionsWARootForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetConnectionsWARootForSelectController = (
  useCase: GetConnectionsWARootForSelectUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetConnectionsWARootForSelectBodyDTO_I,
      GetConnectionsWARootForSelectQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.query });
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
