import { TypeActivation } from "@prisma/client";

export interface Result {
  name: string;
  description: string | null;
  id: number;
  createAt: Date;
  business: string;
  ConnectionOnBusiness: { number: string | null; id: number } | null;
  status: boolean | null;
  inputActivation?: string | null;
  typeActivation: TypeActivation | null;
}

export interface GetChabotsRepository_I {
  fetch(props: {
    accountId: number;
    type?: TypeActivation[];
  }): Promise<Result[]>;
}
