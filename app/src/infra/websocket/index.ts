import { readFile, writeFileSync } from "fs";
import { resolve } from "path";
import { Server } from "socket.io";
import {
  Baileys,
  CacheSessionsBaileysWA,
  killConnectionWA,
} from "../../adapters/Baileys";
import {
  generateNameConnection,
  generateNameSession,
} from "./../../adapters/Baileys/index";
import { cacheAccountSocket } from "./cache";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { prisma } from "../../adapters/Prisma/client";

interface PropsCreateSessionWA_I {
  connectionWhatsId: number;
  number?: string;
}

export const WebSocketIo = (io: Server) => {
  io.on("connection", async (socket) => {
    const { auth } = socket.handshake;

    const stateUser = cacheAccountSocket.get(auth.accountId);

    if (!stateUser) {
      cacheAccountSocket.set(auth.accountId, {
        listSocket: [socket.id],
      });
    } else {
      stateUser.listSocket.push(socket.id);
    }

    socket.on("create-session", async (data: PropsCreateSessionWA_I) => {
      const connectionDB = await prisma.connectionWA.findFirst({
        where: {
          id: data.connectionWhatsId,
          Business: { accountId: auth.accountId },
          interrupted: false,
        },
        select: { type: true, name: true },
      });
      if (!connectionDB) {
        socket.emit("error-connection-wa", {
          message: "Conexão não encontrada ou você não está autorizado!",
          ...data,
        });
        return;
      }
      const nameSession = generateNameSession({
        accountId: auth.accountId,
        connectionWhatsId: data.connectionWhatsId,
        type: connectionDB.type,
        nextNameConnection: generateNameConnection(connectionDB.name),
      });
      await Baileys({
        accountId: auth.accountId,
        connectionWhatsId: data.connectionWhatsId,
        socket: socket,
        nameSession,
        type: connectionDB.type,
        number: data.number,
        onConnection: async (connection) => {
          socket.emit(
            `status-session-${data.connectionWhatsId}`,
            connection ?? "close"
          );
          socket.emit(`status-connection`, {
            connectionId: data.connectionWhatsId,
            connection: "sync",
          });
          setTimeout(() => {
            socket.emit(`status-connection`, {
              connectionId: data.connectionWhatsId,
              connection: connection ?? "close",
            });
          }, 4500);

          const fileBin = resolve(__dirname, "../../../bin");
          const pathFileConnection = `${fileBin}/connections.json`;

          readFile(pathFileConnection, (err, file) => {
            if (err) {
              return console.log(err);
            }
            const listConnections: CacheSessionsBaileysWA[] = JSON.parse(
              file.toString()
            );

            const alreadyExists = listConnections.some(
              ({ connectionWhatsId }) =>
                connectionWhatsId === data.connectionWhatsId
            );

            if (!alreadyExists) {
              listConnections.push({
                accountId: auth.accountId,
                connectionWhatsId: data.connectionWhatsId,
                nameSession,
                type: connectionDB.type,
              });
              writeFileSync(
                pathFileConnection,
                JSON.stringify(listConnections)
              );
            }
          });
        },
      });
    });

    socket.on("revoke-session", async (data: PropsCreateSessionWA_I) => {
      const isconnected = cacheConnectionsWAOnline.get(data.connectionWhatsId);
      if (isconnected) return;
      const connectionDB = await prisma.connectionWA.findFirst({
        where: {
          id: data.connectionWhatsId,
          Business: { accountId: auth.accountId },
          interrupted: false,
        },
        select: { type: true, name: true },
      });
      if (!connectionDB) {
        socket.emit("error-connection-wa", {
          message: "Conexão não encontrada ou você não está autorizado!",
          ...data,
        });
        return;
      }
      await killConnectionWA(
        data.connectionWhatsId,
        auth.accountId,
        generateNameSession({
          accountId: auth.accountId,
          connectionWhatsId: data.connectionWhatsId,
          type: connectionDB.type,
          nextNameConnection: generateNameConnection(connectionDB.name),
        })
      );
    });

    socket.on("disconnect", async (reason) => {
      const stateUser = cacheAccountSocket.get(auth.accountId);
      if (stateUser) {
        stateUser.listSocket = stateUser.listSocket.filter(
          (ids) => ids !== socket.id
        );
        if (stateUser.listSocket.length === 0) {
          cacheAccountSocket.delete(auth.accountId);
        }
      }
    });
  });
};
