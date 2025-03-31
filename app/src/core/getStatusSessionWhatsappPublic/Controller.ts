import { Request, Response } from "express";
import { GetStatusSessionWhatsappPublicDTO_I } from "./DTO";
import { GetStatusSessionWhatsappPublicUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetStatusSessionWhatsappPublicController = (
  useCase: GetStatusSessionWhatsappPublicUseCase
) => {
  const execute = async (
    req: Request<
      GetStatusSessionWhatsappPublicDTO_I,
      any,
      { accountId: number }
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        connectionId: req.params.connectionId,
        accountId: String(req.body.accountId),
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
