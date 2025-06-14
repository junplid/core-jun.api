import { Request, Response } from "express";
import {
  GetInboxDepartmentBodyDTO_I,
  GetInboxDepartmentParamsDTO_I,
} from "./DTO";
import { GetInboxDepartmentUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetInboxDepartmentController = (
  useCase: GetInboxDepartmentUseCase
) => {
  const execute = async (
    req: Request<
      GetInboxDepartmentParamsDTO_I,
      any,
      GetInboxDepartmentBodyDTO_I
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
