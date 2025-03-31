export interface DeletePlanRepository_I {
  delete(props: { id: number }): Promise<void>;
}
