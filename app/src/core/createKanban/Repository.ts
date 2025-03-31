export interface PropsCreate {
  accountId: number;
  name: string;
  businessId: number;
  columns: { name: string; sequence: number; color?: string }[];
}
export interface CreateReturn {
  readonly createAt: Date;
  readonly id: number;
  business: string;
}

export interface CreateKanbanRepository_I {
  create(data: PropsCreate): Promise<CreateReturn>;
  fetchExist(props: {
    name: string;
    accountId: number;
    businessId: number;
  }): Promise<number>;
}
