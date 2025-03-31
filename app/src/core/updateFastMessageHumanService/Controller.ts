import { Request, Response } from "express";
import {
  UpdateFastMessageHumanServiceBodyDTO_I,
  UpdateFastMessageHumanServiceParamsDTO_I,
  UpdateFastMessageHumanServiceQueryDTO_I,
} from "./DTO";
import { UpdateFastMessageHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateFastMessageHumanServiceController = (
  useCase: UpdateFastMessageHumanServiceUseCase
) => {
  const execute = async (
    req: Request<
      UpdateFastMessageHumanServiceParamsDTO_I,
      any,
      UpdateFastMessageHumanServiceBodyDTO_I,
      UpdateFastMessageHumanServiceQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
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
