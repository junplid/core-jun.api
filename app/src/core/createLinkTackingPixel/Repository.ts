export interface Props {
  name: string;
  link: string;
  numberOfExecutions?: number;
  accountId: number;
  businessId: number;
}

export interface CreateLinkTackingPixelRepository_I {
  fetchAlreadyExists(
    props: Omit<Props, "link" | "numberOfExecutions">
  ): Promise<number>;
  create(
    props: Props
  ): Promise<{ createAt: Date; id: number; business: string }>;
}
