import { Request, Response } from "express";
import {
  DeleteInboxDepartmentBodyDTO_I,
  DeleteInboxDepartmentParamsDTO_I,
} from "./DTO";
import { DeleteInboxDepartmentUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteInboxDepartmentController = (
  useCase: DeleteInboxDepartmentUseCase
) => {
  const execute = async (
    req: Request<
      DeleteInboxDepartmentParamsDTO_I,
      any,
      DeleteInboxDepartmentBodyDTO_I
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
