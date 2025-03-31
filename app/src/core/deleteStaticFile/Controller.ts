import { Request, Response } from "express";
import {
  DeleteStaticFileBodyDTO_I,
  DeleteStaticFileParamsDTO_I,
  DeleteStaticFileQueryDTO_I,
} from "./DTO";
import { DeleteStaticFileUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteStaticFileController = (
  useCase: DeleteStaticFileUseCase
) => {
  const execute = async (
    req: Request<
      DeleteStaticFileParamsDTO_I,
      any,
      DeleteStaticFileBodyDTO_I,
      DeleteStaticFileQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.params,
        ...req.query,
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
