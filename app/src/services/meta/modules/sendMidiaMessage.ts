import axios from "axios";

export async function sendMetaMediaOptimized(props: {
  recipient_id: string;
  type: "image" | "video" | "audio" | "file";
  page_token: string;
  url?: string;
  attachmentId?: string;
}): Promise<{ message_id: string; attachment_id: string }> {
  const payload = props.attachmentId
    ? { attachment_id: props.attachmentId }
    : { url: props.url, is_reusable: true };

  const response = await axios.post(
    `https://graph.facebook.com/v19.0/me/messages`,
    {
      recipient: { id: props.recipient_id },
      message: { attachment: { type: props.type, payload: payload } },
    },
    { params: { access_token: props.page_token } },
  );

  return response.data; // Retorna { recipient_id, message_id, attachment_id }
}
