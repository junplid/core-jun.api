export interface CreateVariableHumanServiceRepository_I {
  create(data: {
    name: string;
    userId: number;
    businessId: number;
    accountId: number;
  }): Promise<{ readonly id: number }>;
  fetchAttendantExist(props: {
    userId: number;
  }): Promise<{ businessId: number; accountId: number } | null>;
  fetchExist(props: {
    name: string;
    businessId: number;
  }): Promise<number | undefined>;
}
