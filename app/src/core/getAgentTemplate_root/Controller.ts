import { Request, Response } from "express";
import { GetAgentTemplate_root_ParamsDTO_I } from "./DTO";
import { GetAgentTemplate_root_UseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetAgentTemplate_root_Controller = (
  useCase: GetAgentTemplate_root_UseCase,
) => {
  const execute = async (
    req: Request<GetAgentTemplate_root_ParamsDTO_I, any, any>,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.params);
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
