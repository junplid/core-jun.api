export interface CreateKanbanDTO_I {
  accountId: number;
  businessId: number;
  name: string;
  columns: { name: string; color?: string; sequence: number }[];
}
