export interface DeleteContactWARepository_I {
  delete(props: { id: number }): Promise<void>;
}
