import moment, { Moment } from "moment-timezone";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { GetDataDashboardDTO_I } from "./DTO";
import { GetDataDashboardRepository_I } from "./Repository";

interface leadsPerPeriod_I {
  createAt: Date | string;
  value: number;
}

const formaterDateList = (arr: leadsPerPeriod_I[]) =>
  arr.map((e) => ({
    value: e.value,
    createAt: moment(e.createAt).format("DD/MM"),
  }));

const arrayRange = (length: number, sub?: boolean) =>
  Array.from({ length }, (_, i) => (sub ? Math.abs(i - 1) : i + 1));

export class GetDataDashboardUseCase {
  constructor(private repository: GetDataDashboardRepository_I) {}

  async run(dto: GetDataDashboardDTO_I) {
    const dashboard = await this.repository.fetch(dto);

    const chatbots: string = String(
      dashboard?.chatbots.reduce((ac, connectionOnBusinessId) => {
        const isConnected = !!sessionsBaileysWA
          .get(connectionOnBusinessId)
          ?.ev.emit("connection.update", { connection: "open" });
        return ac + Number(isConnected);
      }, 0) ?? 0
    );
    const connectionsWA: string = String(
      dashboard?.connectionsWA.reduce((ac, connectionOnBusinessId) => {
        const isConnected = !!sessionsBaileysWA
          .get(connectionOnBusinessId)
          ?.ev.emit("connection.update", { connection: "open" });
        return ac + Number(isConnected);
      }, 0) ?? 0
    );

    let leadsPerPeriod: leadsPerPeriod_I[] = [];
    if (dashboard && dashboard.leadsPerPeriod.length) {
      const lastDate = moment(
        dashboard.leadsPerPeriod[dashboard.leadsPerPeriod.length - 1].createAt
      );
      const daysLeft = moment().diff(lastDate, "day");

      if (daysLeft) {
        const rangeLengthLeft = arrayRange(daysLeft, true);

        for await (const index of rangeLengthLeft) {
          dashboard.leadsPerPeriod.push({
            createAt: moment()
              .add(index - 1, "day")
              .toDate(),
            value: 0,
          });
        }
      }

      try {
        const interpoleLeads = await new Promise<leadsPerPeriod_I[]>((res) => {
          const exec = async (current: Moment) => {
            const currentDateIndex = dashboard.leadsPerPeriod.findIndex((s) =>
              moment(s.createAt).isSame(current)
            );
            const dateOldIndex = currentDateIndex - 1;
            if (!dashboard.leadsPerPeriod[dateOldIndex]) {
              res(dashboard.leadsPerPeriod);
              return;
            }
            const amountDiff =
              current.diff(
                dashboard.leadsPerPeriod[dateOldIndex].createAt,
                "day"
              ) - 1;

            // console.log("DEBUG =============");
            // console.log({
            //   leadsPerPeriod: dashboard.leadsPerPeriod,
            //   currentDateIndex,
            //   dateOldIndex,
            //   amountDiff,
            //   old: moment(dashboard.leadsPerPeriod[dateOldIndex]?.createAt),
            //   current,
            // });
            // console.log("FIM DEBUG =============");
            if (!amountDiff) {
              exec(moment(dashboard.leadsPerPeriod[dateOldIndex].createAt));
              return;
            }
            // console.log("PASSOU: ============");
            // console.log({
            //   old: moment(dashboard.leadsPerPeriod[dateOldIndex]?.createAt),
            //   current: current,
            // });
            const startMoment = moment(
              dashboard.leadsPerPeriod[currentDateIndex - 1].createAt
            );
            const rangeLeft = arrayRange(amountDiff);
            for await (const index of rangeLeft) {
              const start = currentDateIndex - 1 + index;
              dashboard.leadsPerPeriod.splice(start, 0, {
                createAt: startMoment.add(1, "day").toDate(),
                value: 0,
              });
            }
            // console.log("PASSOU 2: ============");
            // console.log({ startMoment, rangeLeft });
            // console.log({ newLeads: dashboard.leadsPerPeriod });
            // console.log("=====================================");
            exec(moment(dashboard.leadsPerPeriod[dateOldIndex].createAt));
            // if (dateOldIndex >= 0) {
            //   const dateOld = moment(
            //     dashboard.leadsPerPeriod[dateOldIndex]?.createAt
            //   );
            //   if (dateOld) {
            //     const amountDiff = current.diff(dateOld.subtract(1), "day") - 1;
            //     if (amountDiff) {
            //       const startMoment = moment(
            //         dashboard.leadsPerPeriod[currentDateIndex - 1].createAt
            //       );
            //       const rangeLeft = arrayRange(amountDiff);
            //       for await (const index of rangeLeft) {
            //         const start = currentDateIndex - 1 + index;
            //         dashboard.leadsPerPeriod.splice(start, 0, {
            //           createAt: startMoment.add(1, "day").toDate(),
            //           value: 0,
            //         });
            //       }
            //       exec(moment(dashboard.leadsPerPeriod[dateOldIndex].createAt));
            //     } else {
            //       res(dashboard.leadsPerPeriod);
            //     }
            //   } else {
            //     res(dashboard.leadsPerPeriod);
            //   }
            // } else {
            //   res(dashboard.leadsPerPeriod);
            // }
          };
          exec(
            moment(
              dashboard.leadsPerPeriod[dashboard.leadsPerPeriod.length - 1]
                .createAt
            )
          );
        });
        if (interpoleLeads.length > 15) {
          leadsPerPeriod = interpoleLeads
            .map((e) => ({
              createAt: moment(e.createAt).format("DD/MM"),
              value: e.value,
            }))
            .slice(0, 15);
        } else {
          while (interpoleLeads.length < 15) {
            const current = interpoleLeads[0].createAt;
            interpoleLeads.unshift({
              createAt: moment(current).add(-1, "day").toDate(),
              value: 0,
            });
          }
          leadsPerPeriod = interpoleLeads.map((e) => ({
            createAt: moment(e.createAt).format("DD/MM"),
            value: e.value,
          }));
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (dashboard && !dashboard.leadsPerPeriod?.length) {
      while (dashboard.leadsPerPeriod.length < 15) {
        const current = dashboard.leadsPerPeriod?.[0]?.createAt ?? moment();
        dashboard.leadsPerPeriod.unshift({
          createAt: moment(current).add(-1, "day").toDate(),
          value: 0,
        });
      }
      leadsPerPeriod = dashboard.leadsPerPeriod.map((e) => ({
        createAt: moment(e.createAt).format("DD/MM"),
        value: e.value,
      }));
    }

    return {
      message: "OK!",
      status: 200,
      dashboard: { ...dashboard, chatbots, connectionsWA, leadsPerPeriod },
    };
  }
}
