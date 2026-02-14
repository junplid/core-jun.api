import { WASocket, WAMessage } from "baileys";
import { messageCache } from "..";

export async function safeSendMessage(
  sock: WASocket,
  jid: string, // pode ser '5511999999999@s.whatsapp.net'
  payload: any, // { text }, { image } etc,
  quoted?: WAMessage,
) {
  const msg = await sock.sendMessage(jid, { ...payload }, { quoted });
  // cacheia só o que você enviou agora
  if (msg) messageCache.set(`${jid}|${msg.key.id}`, msg);
  return msg;
}
