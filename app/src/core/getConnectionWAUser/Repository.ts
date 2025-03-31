import { ConnectionConfig } from "@prisma/client";

export type IResult = Omit<ConnectionConfig, "connectionId"> | null;

export interface GetConnectionWAUserRepository_I {
  fetch(props: {
    connectionId: number;
    accountId: number;
  }): Promise<IResult | null>;
  fetchConn(id: number): Promise<boolean>;
}
