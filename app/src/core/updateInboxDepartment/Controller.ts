import { Request, Response } from "express";
import {
  UpdateInboxDepartmentBodyDTO_I,
  UpdateInboxDepartmentParamsDTO_I,
  UpdateInboxDepartmentQueryDTO_I,
} from "./DTO";
import { UpdateInboxDepartmentUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateInboxDepartmentController = (
  useCase: UpdateInboxDepartmentUseCase
) => {
  const execute = async (
    req: Request<
      UpdateInboxDepartmentParamsDTO_I,
      any,
      UpdateInboxDepartmentBodyDTO_I,
      UpdateInboxDepartmentQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
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
