import { Request, Response } from "express";
import { TestFbPixelDTO_I } from "./DTO";
import { TestFbPixelUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const TestFbPixelController = (useCase: TestFbPixelUseCase) => {
  const execute = async (
    req: Request<any, any, TestFbPixelDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
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
