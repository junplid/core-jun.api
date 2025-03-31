import { Request, Response } from "express";
import {
  GetTagsContactAccountBodyDTO_I,
  GetTagsContactAccountQueryDTO_I,
} from "./DTO";
import { GetTagsContactAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetTagsContactAccountController = (
  useCase: GetTagsContactAccountUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetTagsContactAccountBodyDTO_I,
      GetTagsContactAccountQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.query });
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
