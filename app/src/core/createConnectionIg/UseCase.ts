import { CreateConnectionIgDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { encrypt } from "../../libs/encryption";
import { metaAccountsCache } from "../../services/meta/cache";

export class CreateConnectionIgUseCase {
  constructor() {}

  async run({ accountId, agentId, modal_id, ...dto }: CreateConnectionIgDTO_I) {
    try {
      const getAccounts = metaAccountsCache.get<
        {
          page_id: string;
          page_name: string;
          page_token: string;
          ig_id: string;
          ig_username: string;
          ig_picture: string;
          used_by: {
            name: string;
            id: number;
          }[];
        }[]
      >(modal_id);
      const pickAccount = getAccounts?.find((s) => s.ig_id === dto.ig_id);
      if (!pickAccount) {
        console.log("error 1");
        throw new ErrorResponse(400).toast({
          title: "Não foi possivel encontrar a conta do instagram",
          type: "error",
        });
      }
      const { page_token, used_by, ...rest } = pickAccount;
      const credentials = encrypt({ account_access_token: page_token });

      const data = await prisma.connectionIg.create({
        data: {
          ...rest,
          ...dto,
          ...(agentId && { AgentAI: { connect: { id: agentId } } }),
          credentials,
        },
        select: {
          id: true,
          createAt: true,
          Business: { select: { name: true, id: true } },
        },
      });

      metaAccountsCache.del(modal_id);

      return {
        message: "OK!",
        status: 201,
        connectionIg: {
          ...data,
          picture: rest.ig_picture,
          name: rest.ig_username,
        },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Erro ao criar conexão com instagram.",
        type: "error",
      });
    }
  }
}
