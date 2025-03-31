import { Request, Response } from "express";
import { CreateStaticFileDTO_I } from "./DTO";
import { CreateStaticFileUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateStaticFileController = (
  useCase: CreateStaticFileUseCase
) => {
  const execute = async (
    req: Request<any, any, CreateStaticFileDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(
        req.body as Required<CreateStaticFileDTO_I>
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
