import { Request, Response } from "express";
import {
  DeleteTagOnBusinessBodyDTO_I,
  DeleteTagOnBusinessParamsDTO_I,
} from "./DTO";
import { DeleteTagOnBusinessUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteTagOnBusinessController = (
  useCase: DeleteTagOnBusinessUseCase
) => {
  const execute = async (
    req: Request<
      DeleteTagOnBusinessParamsDTO_I,
      any,
      DeleteTagOnBusinessBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params };
      const data = await useCase.run(dto);
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
