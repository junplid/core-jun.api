export interface PropsDelete {
  tagOnBusinessId: number;
}

export interface PropsFetchExist {
  tagOnBusinessId: number;
  accountId: number;
}

export interface DeleteTagOnBusinessRepository_I {
  delete(data: PropsDelete): Promise<void>;
  fetchExist(props: PropsFetchExist): Promise<number>;
}
