export interface CreateTagHumanServiceRepository_I {
  fetchAttendantExist(props: {
    userId: number;
  }): Promise<{ businessId: number; accountId: number } | null>;
  create(props: {
    name: string;
    businessId: number;
    accountId: number;
  }): Promise<{ id: number }>;
  fetchExists(props: {
    name: string;
    businessId: number;
    accountId: number;
  }): Promise<boolean>;
}
