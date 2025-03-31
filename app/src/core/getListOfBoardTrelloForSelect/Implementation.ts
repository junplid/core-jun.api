import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Trello } from "../../adapters/Trello";
import { GetListOfBoardTrelloForSelectRepository_I } from "./Repository";

export class GetListOfBoardTrelloForSelectImplementation
  implements GetListOfBoardTrelloForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: {
    key: string;
    token: string;
    boardId: string;
  }): Promise<{ name: string; id: string }[]> {
    try {
      const trello = new Trello(props.key, props.token);
      return await trello.getListOfBoard({ boardId: props.boardId });
    } catch (error) {
      console.log(error);
      throw new Error("Method not implemented.");
    }
  }

  async fetchIntegr(props: {
    accountId: number;
    integrationId: number;
  }): Promise<{ token: string; key: string } | null> {
    try {
      const data = await this.prisma.integrations.findUnique({
        where: {
          id: props.integrationId,
          accountId: props.accountId,
        },
        select: {
          key: true,
          token: true,
        },
      });
      return data ? { token: data.token!, key: data.key! } : null;
    } catch (error) {
      console.log(error);
      throw new Error("Method not implemented.");
    }
  }
}
