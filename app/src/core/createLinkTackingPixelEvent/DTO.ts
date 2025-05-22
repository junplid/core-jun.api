export interface CreateLinkTackingPixelEventDTO_I {
  accountId: number;
  linkTrackingPixelId: number;
  campaignId?: number;
  flowId: string;
  flowStateId: number;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  event: string;
  value: string;
}
