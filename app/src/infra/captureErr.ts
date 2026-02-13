import { NotificationApp } from "../utils/notificationApp";

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  shutdown();
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
  shutdown();
});

async function shutdown() {
  await NotificationApp({
    accountId: 1,
    tag: `server-kill`,
    title_txt: "🚨🚨🚨",
    body_txt: "Servidor caiu ‼️",
    onFilterSocket: () => [],
  });

  process.exit(1);
}
