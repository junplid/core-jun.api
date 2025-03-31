import { Request, Response } from "express";
import { CloneAudienceParamsDTO_I, CloneAudienceBodyDTO_I } from "./DTO";
import { CloneAudienceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CloneAudienceController = (useCase: CloneAudienceUseCase) => {
  const execute = async (
    req: Request<CloneAudienceParamsDTO_I, any, CloneAudienceBodyDTO_I>,
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
