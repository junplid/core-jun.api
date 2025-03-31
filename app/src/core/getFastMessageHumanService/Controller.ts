import { Request, Response } from "express";
import {
  GetFastMessageHumanServiceBodyDTO_I,
  GetFastMessageHumanServiceParamsDTO_I,
} from "./DTO";
import { GetFastMessageHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFastMessageHumanServiceController = (
  useCase: GetFastMessageHumanServiceUseCase
) => {
  const execute = async (
    req: Request<
      GetFastMessageHumanServiceParamsDTO_I,
      any,
      GetFastMessageHumanServiceBodyDTO_I
    >,
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
