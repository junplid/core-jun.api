export interface PropsCreate {
  name: string;
  accountId: number;
}

export interface PropsUpdate {
  fileName: string;
  accountId: number;
  id: number;
}

export interface CreateImageConnectionUserRepository_I {
  update(props: PropsUpdate): Promise<void>;
  fetchExist(userId: number): Promise<{
    oldImage?: string | null;
  } | null>;
}
