export interface UpdateDisconnectConnectionWhatsappRepository_I {
  fetchExist(props: { id: number; accountId: number }): Promise<number>;
}
