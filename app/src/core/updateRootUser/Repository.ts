export interface UpdateRootUserRepository_I {
  update(
    filter: { rootId: number },
    data: {
      email: string;
      password: string;
    }
  ): Promise<void>;
}
