import { LoginRootDTO_I } from "./DTO";

import { compare } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { prisma } from "../../adapters/Prisma/client";

export class LoginRootUseCase {
  constructor() {}

  async run(dto: LoginRootDTO_I) {
    const user = await prisma.rootUsers.findFirst({
      where: {
        email: dto.email,
      },
      select: { id: true, hash: true, password: true },
    });

    if (!user) {
      throw {
        message: "Dados de acesso incorretos",
        status: 400,
        erros: [
          {
            path: ["email", "password"],
            code: 2,
            message: "Dados de acesso incorretos",
            name: "incorrect data",
          },
        ],
      };
    }

    const comparePassword = await compare(dto.password, user.password);

    if (!comparePassword) {
      throw {
        message: "Dados de acesso incorretos",
        status: 400,
        erros: [
          {
            path: ["email", "password"],
            code: 2,
            message: "Dados de acesso incorretos",
            name: "incorrect data",
          },
        ],
      };
    }

    const token = await createTokenAuth(
      { type: "root", id: user.id, hash: user.hash },
      "secret123"
    );

    return {
      message: "Login efetuado com sucesso!",
      status: 200,
      token,
    };
  }
}
