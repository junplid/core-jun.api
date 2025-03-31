import { Request, Response } from "express";
import { UpdateCustomerBodyDTO_I, UpdateCustomerQueryDTO_I } from "./DTO";
import { UpdateCustomerUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateCustomerController = (useCase: UpdateCustomerUseCase) => {
  const execute = async (
    req: Request<any, any, UpdateCustomerBodyDTO_I, UpdateCustomerQueryDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.query };
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
