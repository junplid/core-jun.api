import { Request, Response } from "express";
import { GetStaticFileBodyDTO_I, GetStaticFileQueryDTO_I } from "./DTO";
import { GetStaticFileUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetStaticFileController = (useCase: GetStaticFileUseCase) => {
  const execute = async (
    req: Request<any, any, GetStaticFileBodyDTO_I, GetStaticFileQueryDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.query, ...req.body });
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
