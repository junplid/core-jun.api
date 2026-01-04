import { readFile } from "fs";
import { Baileys, CacheSessionsBaileysWA } from "../adapters/Baileys";
import { socketIo } from "../infra/express";
import { cacheAccountSocket } from "../infra/websocket/cache";
import { resolve } from "path";

let path = "";
if (process.env?.NODE_ENV === "production") {
  path = resolve(__dirname, "../bin/connections.json");
} else {
  path = resolve(__dirname, "../../bin/connections.json");
}

export const startConnections = (): Promise<void> =>
  new Promise(async (res, rej) => {
    console.log(path);
    readFile(path, async (err, file) => {
      if (err) return rej(err);
      console.log("--------------------------");
      console.log("INICIANDO CONEXÕES!!");
      console.log("--------------------------");

      const listSessionsConnections: CacheSessionsBaileysWA[] = JSON.parse(
        file.toString()
      );

      if (!listSessionsConnections.length) {
        console.log("NÃO TINHA CONEXÕES PARA SEREM INICIADAS!!");
        return res();
      }

      const clientsWA: CacheSessionsBaileysWA[] = [];

      await new Promise<void>(async (resx) => {
        for await (const session of listSessionsConnections) {
          try {
            const socketIds = cacheAccountSocket.get(
              session.accountId
            )?.listSocket;

            await new Promise<void>(async (ress) => {
              await Baileys({
                ...session,
                maxConnectionAttempts: 1,
                onConnection: (conn) => {
                  if (conn === "open") {
                    socketIds?.forEach((socketId) => {
                      socketIo.to(socketId.id).emit(`status-connection`, {
                        connectionId: session.connectionWhatsId,
                        connection: "sync",
                      });
                      setTimeout(() => {
                        socketIo.to(socketId.id).emit(`status-connection`, {
                          connectionId: session.connectionWhatsId,
                          connection: "open",
                        });
                      }, 4500);
                    });
                    clientsWA.push(session);
                    return ress();
                  } else {
                    return ress();
                  }
                },
              });
            });
          } catch (error) {
            console.log("Conexão falhou!");
          }
        }
        resx();
      });
      console.log("--------------------------");
      console.log("CONEXÕES INICIADAS!!");
      console.log("--------------------------");
      return res();
    });
  });
