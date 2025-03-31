import { Request, Response } from "express";
import {
  DeleteTagContactHumanServiceBodyDTO_I,
  DeleteTagContactHumanServiceParamsDTO_I,
} from "./DTO";
import { DeleteTagContactHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteTagContactHumanServiceController = (
  useCase: DeleteTagContactHumanServiceUseCase
) => {
  const execute = async (
    req: Request<
      DeleteTagContactHumanServiceParamsDTO_I,
      any,
      DeleteTagContactHumanServiceBodyDTO_I
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
