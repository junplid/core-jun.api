import { Request, Response } from "express";
import { GetGeolocationsDTO_I } from "./DTO";
import { GetGeolocationsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetGeolocationsController = (useCase: GetGeolocationsUseCase) => {
  const execute = async (
    req: Request<any, any, GetGeolocationsDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
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
