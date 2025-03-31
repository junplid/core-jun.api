import { Request, Response } from "express";
import {
  CloneFacebookIntegrationParamsDTO_I,
  CloneFacebookIntegrationBodyDTO_I,
} from "./DTO";
import { CloneFacebookIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CloneFacebookIntegrationController = (
  useCase: CloneFacebookIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      CloneFacebookIntegrationParamsDTO_I,
      any,
      CloneFacebookIntegrationBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.params,
        ...req.body,
      });
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(error.statusCode ?? 500).json(error.message ?? error);
    }
  };

  return { execute };
};
