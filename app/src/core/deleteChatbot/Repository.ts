export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteChatbotRepository_I {
  delete(props: Props): Promise<void>;
}
