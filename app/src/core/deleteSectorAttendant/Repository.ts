export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteSectorAttendantRepository_I {
  delete(props: Props): Promise<void>;
}
