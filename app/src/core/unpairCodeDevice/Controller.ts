import { Request, Response } from "express";
import { UnpairCodeDeviceBodyDTO_I, UnpairCodeDeviceParamsDTO_I } from "./DTO";
import { UnpairCodeDeviceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UnpairCodeDeviceController = (
  useCase: UnpairCodeDeviceUseCase,
) => {
  const execute = async (
    req: Request<UnpairCodeDeviceParamsDTO_I, any, UnpairCodeDeviceBodyDTO_I>,
    res: Response,
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
      const data = await useCase.run(dto);
      return res.status(200).json(data);
    } catch (error: any) {
      console.log(error);
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
