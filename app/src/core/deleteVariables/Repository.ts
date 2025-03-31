export interface DeleteVariableRepository_I {
  delete(props: { variableId: number }): Promise<void>;
  fetchExist(props: { variableId: number; accountId: number }): Promise<number>;
}
