import { createTokenAuth } from "../../helpers/authToken";
import { LoginHumanServiceDTO_I } from "./DTO";
import { LoginHumanServiceRepository_I } from "./Repository";

export class LoginHumanServiceUseCase {
  constructor(private repository: LoginHumanServiceRepository_I) {}

  async run({ password, username }: LoginHumanServiceDTO_I) {
    const sectorsAttendants = await this.repository.findSectorsAttendants({
      username,
    });

    if (sectorsAttendants) {
      if (sectorsAttendants.password === password) {
        if (!sectorsAttendants.status) {
          throw {
            title: "Conta desativada!",
            message: "Não é possível acessar uma conta desativada.",
            statusCode: 400,
          };
        }
        const token = await createTokenAuth(
          {
            id: sectorsAttendants.id,
            type: "attendant",
            hash: sectorsAttendants.hash,
          },
          "secret123"
        );
        const { password, ...rest } = sectorsAttendants;
        return {
          message: "Login efetuado com sucesso!",
          status: 200,
          token,
          data: { ...rest, type: "sectorAttendant" },
        };
      }
      throw {
        message: "Dados de acesso incorretos",
        statusCode: 400,
        erros: [
          {
            path: ["username", "password"],
            code: 2,
            message: "Dados de acesso incorretos",
            name: "incorrect data",
          },
        ],
      };
    } else {
      const supervisor = await this.repository.findSupervisors({
        username,
      });
      if (supervisor) {
        if (supervisor.password === password) {
          const token = await createTokenAuth(
            { id: supervisor.id, type: "supervisor", hash: supervisor.hash },
            "secret123"
          );
          const { password, ...rest } = supervisor;
          return {
            message: "Login efetuado com sucesso!",
            status: 200,
            token,
            data: { ...rest, type: "supervisor" },
          };
        }
        throw {
          message: "Dados de acesso incorretos",
          statusCode: 400,
          erros: [
            {
              path: ["username", "password"],
              code: 2,
              message: "Dados de acesso incorretos",
              name: "incorrect data",
            },
          ],
        };
      }
    }

    throw {
      message: "Dados de acesso incorretos",
      statusCode: 400,
      erros: [
        {
          path: ["username", "password"],
          code: 2,
          message: "Dados de acesso incorretos",
          name: "incorrect data",
        },
      ],
    };
  }
}
