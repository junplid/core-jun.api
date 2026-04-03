import { Request, Response } from "express";
import {
  PairCodeDeviceBodyDTO_I,
  PairCodeDeviceParamsDTO_I,
  PairCodeDeviceQueryDTO_I,
} from "./DTO";
import { PairCodeDeviceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const PairCodeDeviceController = (useCase: PairCodeDeviceUseCase) => {
  const execute = async (
    req: Request<
      PairCodeDeviceParamsDTO_I,
      any,
      PairCodeDeviceBodyDTO_I,
      PairCodeDeviceQueryDTO_I
    >,
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
