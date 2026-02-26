import { Request, Response } from "express";
import { CreateAgentTemplate_root_DTO_I } from "./DTO";
import { CreateAgentTemplate_root_UseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateAgentTemplate_root_Controller = (
  useCase: CreateAgentTemplate_root_UseCase,
) => {
  const execute = async (
    req: Request<any, any, CreateAgentTemplate_root_DTO_I>,
    res: Response,
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
