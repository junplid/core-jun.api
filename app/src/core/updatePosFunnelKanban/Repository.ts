export interface PropsAlreadyExisting {
  userId: number;
  funnelKanbanId: number;
  columnId: number;
}

export interface PropsUpdate {
  ticketId: number;
  columnId: number;
  nextSequence: number;
  funnelKanbanId: number;
}

export interface UpdatePosFunnelKanbanRepository_I {
  alreadyExisting(
    props: PropsAlreadyExisting
  ): Promise<{ sequence: number } | null>;
  update(props: PropsUpdate): Promise<void>;
}
