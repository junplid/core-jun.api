import { Request, Response } from "express";
import {
  UpdateDisconnectConnectionWhatsappBodyDTO_I,
  UpdateDisconnectConnectionWhatsappParamsDTO_I,
} from "./DTO";
import { UpdateDisconnectConnectionWhatsappUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateDisconnectConnectionWhatsappController = (
  useCase: UpdateDisconnectConnectionWhatsappUseCase
) => {
  const execute = async (
    req: Request<
      UpdateDisconnectConnectionWhatsappParamsDTO_I,
      any,
      UpdateDisconnectConnectionWhatsappBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
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
