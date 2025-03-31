import { Request, Response } from "express";
import { UpdateSubAccountBodyDTO_I, UpdateSubAccountParamsDTO_I } from "./DTO";
import { UpdateSubAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateSubAccountController = (
  useCase: UpdateSubAccountUseCase
) => {
  const execute = async (
    req: Request<UpdateSubAccountParamsDTO_I, any, UpdateSubAccountBodyDTO_I>,
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
