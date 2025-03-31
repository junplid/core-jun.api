import { Request, Response } from "express";
import { GetSubAccountBodyDTO_I, GetSubAccountParamsDTO_I } from "./DTO";
import { GetSubAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetSubAccountController = (useCase: GetSubAccountUseCase) => {
  const execute = async (
    req: Request<GetSubAccountParamsDTO_I, any, GetSubAccountBodyDTO_I>,
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
