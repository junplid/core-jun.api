import { createMetaHttpClient } from "../meta.client";

export async function sendMetaMarkSeen(props: {
  recipient_id: string;
  page_token: string;
}) {
  const client = createMetaHttpClient();

  await client.post(
    `/me/messages`,
    { recipient: { id: props.recipient_id }, sender_action: "mark_seen" },
    { params: { access_token: props.page_token } },
  );
}
