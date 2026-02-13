import { createMetaHttpClient } from "../meta.client";

export async function sendMetaTyping(props: {
  recipient_id: string;
  page_token: string;
  delay?: number;
}) {
  const delay = Math.max(props.delay || 0, 0);
  if (!delay) return;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const client = createMetaHttpClient();
  await client.post(
    `/me/messages`,
    { recipient: { id: props.recipient_id }, sender_action: "typing_on" },
    { params: { access_token: props.page_token } },
  );
  await wait(delay * 1_000);
}
