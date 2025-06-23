import { Request, Response } from "express";
import { GetFbPixelBodyDTO_I, GetFbPixelParamsDTO_I } from "./DTO";
import { GetFbPixelUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFbPixelController = (useCase: GetFbPixelUseCase) => {
  const execute = async (
    req: Request<GetFbPixelParamsDTO_I, any, GetFbPixelBodyDTO_I>,
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
