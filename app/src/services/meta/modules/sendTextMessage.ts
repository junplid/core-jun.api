import { createMetaHttpClient } from "../meta.client";

export async function sendMetaTextMessage(props: {
  recipient_id: string;
  text: string;
  page_token: string;
}): Promise<{ message_id: string }> {
  const client = createMetaHttpClient();
  const response = await client.post(
    `/me/messages`,
    {
      recipient: { id: props.recipient_id },
      messaging_type: "RESPONSE",
      message: { text: props.text },
    },
    { params: { access_token: props.page_token } },
  );
  return response.data;
}
