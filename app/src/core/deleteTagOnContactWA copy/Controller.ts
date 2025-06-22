import { Request, Response } from "express";
import {
  DeleteTagOnContactWAQueryDTO_I,
  DeleteTagOnContactWABodyDTO_I,
  DeleteTagOnContactWAParamsDTO_I,
} from "./DTO";
import { DeleteTagOnContactWAUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteTagOnContactWAController = (
  useCase: DeleteTagOnContactWAUseCase
) => {
  const execute = async (
    req: Request<
      DeleteTagOnContactWAParamsDTO_I,
      any,
      DeleteTagOnContactWABodyDTO_I,
      DeleteTagOnContactWAQueryDTO_I
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
