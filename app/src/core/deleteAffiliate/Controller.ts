import { Request, Response } from "express";
import { DeleteAffiliatesParamsDTO_I } from "./DTO";
import { DeleteAffiliatesUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteAffiliatesController = (
  useCase: DeleteAffiliatesUseCase
) => {
  const execute = async (
    req: Request<DeleteAffiliatesParamsDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.params);
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
