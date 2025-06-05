import { Request, Response } from "express";
import { CreateStorageFileDTO_I } from "./DTO";
import { CreateStorageFileUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateStorageFileController = (
  useCase: CreateStorageFileUseCase
) => {
  const execute = async (
    req: Request<any, any, CreateStorageFileDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(
        req.body as Required<CreateStorageFileDTO_I>
      );
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
