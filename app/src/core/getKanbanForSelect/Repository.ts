export interface GetKanbanForSelectRepository_I {
  fetch(where: {
    ticketId: number;
    userId: number;
  }): Promise<{ name: string; id: number }[] | null>;
}
