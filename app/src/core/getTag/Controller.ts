import { Request, Response } from "express";
import { GetTagBodyDTO_I, GetTagParamsDTO_I } from "./DTO";
import { GetTagUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTagController = (useCase: GetTagUseCase) => {
  const execute = async (
    req: Request<GetTagParamsDTO_I, any, GetTagBodyDTO_I>,
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
