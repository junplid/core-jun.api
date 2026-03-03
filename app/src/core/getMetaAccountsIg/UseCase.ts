import { GetAccountsIgDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { getMetaAccountsIg } from "../../services/meta/meta.service";
import { prisma } from "../../adapters/Prisma/client";
import { metaAccountsCache } from "../../services/meta/cache";
import { getMetaLongAccessToken } from "../../services/meta/meta.auth";

interface Account {
  used_by: {
    id: number;
    name: string;
  }[];
  page_id: string;
  page_name: string;
  ig_id: string;
  ig_username: string;
  ig_picture: string;
}

export class GetAccountsIgUseCase {
  constructor() {}

  async run(dto: GetAccountsIgDTO_I) {
    let list_account: Account[] = [];

    try {
      const long_access_token = await getMetaLongAccessToken(dto.access_token);
      const accounts = await getMetaAccountsIg(long_access_token);
      const resolveAccounts = await Promise.all(
        accounts.map(async (s) => {
          const get = await prisma.connectionIg.findFirst({
            where: { ig_id: s.ig_id },
            select: {
              id: true,
              Chatbot: { select: { name: true, id: true } },
            },
          });
          return { ...s, used_by: get?.Chatbot.length ? get.Chatbot : [] };
        }),
      );
      metaAccountsCache.set(
        dto.accountId,
        resolveAccounts.filter((s) => !s.used_by.length),
      );

      list_account = resolveAccounts.map(({ page_token, ...s }) => s);
    } catch (error) {
      throw new ErrorResponse(400).input({
        path: "access_token",
        text: "Token permanente inválido.",
      });
    }

    return {
      message: "OK!",
      status: 200,
      accounts: list_account,
    };
  }
}
