import { CreateRootDTO_I } from "./DTO";

import { genSalt, hash as hashBcrypt } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateRootUseCase {
  constructor() {}

  async run({ ...dto }: CreateRootDTO_I) {
    const salt = await genSalt(8);
    const nextPassword = await hashBcrypt(dto.password, salt);

    const exist = await prisma.rootUsers.count();

    if (exist) {
      throw new ErrorResponse(500).container(
        "Já existe um usuário root cadastrado."
      );
    }

    const { id, hash: hashAccount } = await prisma.rootUsers.create({
      data: { ...dto, password: nextPassword },
      select: { id: true, hash: true },
    });

    const token = await createTokenAuth(
      { type: "root", id, hash: hashAccount },
      "secret123"
    );

    return { status: 201, token };
  }
}
