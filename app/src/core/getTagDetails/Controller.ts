import { Request, Response } from "express";
import { GetTagDetailsBodyDTO_I, GetTagDetailsParamsDTO_I } from "./DTO";
import { GetTagDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTagDetailsController = (useCase: GetTagDetailsUseCase) => {
  const execute = async (
    req: Request<GetTagDetailsParamsDTO_I, any, GetTagDetailsBodyDTO_I>,
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
