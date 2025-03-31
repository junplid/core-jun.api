import { Request, Response } from "express";
import {
  GetFastMessageHumanDetailsServiceBodyDTO_I,
  GetFastMessageHumanDetailsServiceParamsDTO_I,
} from "./DTO";
import { GetFastMessageHumanDetailsServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFastMessageHumanDetailsServiceController = (
  useCase: GetFastMessageHumanDetailsServiceUseCase
) => {
  const execute = async (
    req: Request<
      GetFastMessageHumanDetailsServiceParamsDTO_I,
      any,
      GetFastMessageHumanDetailsServiceBodyDTO_I
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
