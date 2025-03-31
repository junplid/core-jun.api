export interface LoginRootRepository_I {
  find(props: { email: string }): Promise<{
    password: string;
    id: number;
    hash: string;
  } | null>;
}
