import { Request, Response } from "express";
import { AsaasWebHookChargesDTO_I } from "./DTO";
import { AsaasWebHookChargesUseCase } from "./UseCase";

export const AsaasWebHookChargesController = (
  useCase: AsaasWebHookChargesUseCase
) => {
  const execute = async (
    req: Request<any, any, AsaasWebHookChargesDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
      return res.status(200).json(data);
    } catch (error: any) {
      if (error) {
        return res.status(error.statusCode ?? 500).json(error.details ?? error);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
