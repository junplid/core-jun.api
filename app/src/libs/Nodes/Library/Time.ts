import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { NodeTimeData } from "../Payload";

type PropsNodeTime =
  | {
      data: NodeTimeData;
      type: "flow";
      nodeId: string;
    }
  | {
      data: NodeTimeData;
      type: "reply";
      message?: string;
      midia?: boolean;
      nodeId: string;
    };

export const NodeTime = (props: PropsNodeTime): Promise<boolean> =>
  new Promise(async (res, rej) => {
    const data = props;
    console.log(props);

    if (data.type === "reply") {
      if (data.data.type === "perLeadAction") {
        if (data.data.data.expected === "text") {
          console.log("VEIO AQUI EM QUALQUER TEXTO");
          if (data.data.data.any) return res(true);
          const activators = data.data.data.activators.map((e) => e.v);
          if (data.data.data.run === "contains") {
            const regex = new RegExp(
              `(${activators.join("|")})`,
              `g${data.data.data.caseSensitive ? "i" : ""}`
            );
            return regex.test(data.message ?? "") ? res(true) : res(false);
          }
          if (data.data.data.run === "equal") {
            const regex = new RegExp(
              `^(${activators.join("|")})$`,
              data.data.data.caseSensitive ? "i" : undefined
            );
            return regex.test(data.message ?? "") ? res(true) : res(false);
          }
          if (data.data.data.run === "starts-with") {
            const regex = new RegExp(
              `^(${activators.join("|")})`,
              data.data.data.caseSensitive ? "i" : undefined
            );
            return regex.test(data.message ?? "") ? res(true) : res(false);
          }
        }
        if (data.data.data.expected === "midia" && !!data.midia)
          return res(true);
        if (data.data.data.expected === "link") {
          if (!!/https?:\/\/\S+|www\.\S+/.test(data.message ?? "")) {
            return res(true);
          } else {
            return res(false);
          }
        }
        return res(false);
      }
      return res(false);
    }
    if (data.type === "flow") {
      if (data.data.type === "perTime") {
        if (data.data.data.option === "delayer") {
          const { type, value } = data.data.data;
          const nextTimeStart = new Date(moment().add(value, type).toString());
          await new Promise<void>((resJob) => {
            scheduleJob(nextTimeStart, () => {
              return resJob();
            });
          }).then(() => res(true));
        }
        if (data.data.data.option === "date") {
          if (data.data.data.data.run === "specificDate") {
            const { value } = data.data.data.data.data;
            const currentMoment = moment(value, "YYYY-MM-DDTHH:mm").add(3, "h");
            await new Promise<void>((resJob) => {
              scheduleJob(currentMoment.toDate(), () => {
                return resJob();
              });
            }).then(() => res(true));
          }
          if (data.data.data.data.run === "dateScheduled") {
            if (data.data.data.data.data.run === "nextDay") {
              const { day, hourA, hourB } = data.data.data.data.data;
              const isDay = moment().get("day");
              const config = {
                day,
                hour: Number(hourA.slice(0, 2)),
                minute: Number(hourA.slice(3, 5)),
              };

              if (isDay === day) {
                const momentA = moment()
                  .tz("America/Sao_Paulo")
                  .set({
                    hour: Number(hourA.slice(0, 2)),
                    minute: Number(hourA.slice(3, 5)),
                  });
                const momentB = moment()
                  .tz("America/Sao_Paulo")
                  .set({
                    hour: Number(hourB.slice(0, 2)),
                    minute: Number(hourB.slice(3, 5)),
                  });
                const isBettwen = moment()
                  .tz("America/Sao_Paulo")
                  .isBetween(momentA, momentB);

                if (isBettwen) {
                  return res(true);
                } else {
                  const targetDate = moment().set({ day });
                  const isAfter = moment().isAfter(targetDate);
                  if (isAfter) {
                    const nextDate = moment()
                      .add(1, "month")
                      .set(config)
                      .toDate();
                    await new Promise<void>((resJob) => {
                      scheduleJob(nextDate, () => {
                        return resJob();
                      });
                    }).then(() => res(true));
                  } else {
                    const nextDate = moment().set(config).toDate();
                    await new Promise<void>((resJob) => {
                      scheduleJob(nextDate, () => {
                        return resJob();
                      });
                    }).then(() => res(true));
                  }

                  const nextDate = moment()
                    .add(1, "month")
                    .set(config)
                    .toDate();
                  await new Promise<void>((resJob) => {
                    scheduleJob(nextDate, () => {
                      return resJob();
                    });
                  }).then(() => res(true));
                }
              }

              if (isDay !== day) {
                const targetDate = moment().set({ day });
                const isAfter = moment().isAfter(targetDate);
                if (isAfter) {
                  const nextDate = moment()
                    .add(1, "month")
                    .set(config)
                    .toDate();
                  await new Promise<void>((resJob) => {
                    scheduleJob(nextDate, () => {
                      return resJob();
                    });
                  }).then(() => res(true));
                } else {
                  const nextDate = moment().set({ day }).toDate();
                  await new Promise<void>((resJob) => {
                    scheduleJob(nextDate, () => {
                      return resJob();
                    });
                  }).then(() => res(true));
                }
              }
            }
            return res(false);
          }
          return res(false);
        }
        return res(false);
      }
      return res(false);
    }
    return res(false);
  });
