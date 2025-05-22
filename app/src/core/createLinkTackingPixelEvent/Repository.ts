export interface Props {
  event: string;
  value: string;
  campaignId?: number;
  accountId: number;
  contactsWAOnAccountId: number;
  linkTrackingPixelId: number;
  connectionWhatsId: number;
}

export interface CreateLinkTackingPixelEventRepository_I {
  create(props: Props): Promise<void>;
  findFlow(props: { flowId: string; accountId: number }): Promise<{
    edges: any;
    nodes: any;
  } | null>;
  findInfo(props: { contactsWAOnAccountId: number }): Promise<{
    numberLead: string;
  } | null>;
  findInfoConnection(
    connectionWhatsId: number
  ): Promise<{ number: string | null; businessName: string } | null>;
}
