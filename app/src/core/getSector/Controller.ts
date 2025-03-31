import { Request, Response } from "express";
import { GetSectorBodyDTO_I, GetSectorParamsDTO_I } from "./DTO";
import { GetSectorUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetSectorController = (useCase: GetSectorUseCase) => {
  const execute = async (
    req: Request<GetSectorParamsDTO_I, any, GetSectorBodyDTO_I>,
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
