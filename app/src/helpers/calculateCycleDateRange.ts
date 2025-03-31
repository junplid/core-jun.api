import { TypeCyclePlanPeriods } from "@prisma/client";
import moment from "moment-timezone";

/**
 * retorna o intervalo de datas (start e end) baseado no ciclo.
 * @param cycle "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY"
 * @returns dateStart: "YYYY-MM-DD" | dateEnd: "YYYY-MM-DD"
 */
export function calculateCycleDateRange(cycle: TypeCyclePlanPeriods): {
  dateStart: string;
  dateEnd: string;
} {
  let dateStart = "";
  let dateEnd = "";

  if (cycle === "MONTHLY") {
    dateStart = moment().startOf("month").format("YYYY-MM-DD");
    dateEnd = moment().endOf("month").format("YYYY-MM-DD");
  } else if (cycle === "BIMONTHLY") {
    dateStart = moment()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DD");
    dateEnd = moment().endOf("month").format("YYYY-MM-DD");
  } else if (cycle === "BIWEEKLY") {
    dateStart = moment()
      .subtract(2, "weeks")
      .startOf("isoWeek")
      .format("YYYY-MM-DD");
    dateEnd = moment().endOf("isoWeek").format("YYYY-MM-DD");
  } else if (cycle === "WEEKLY") {
    dateStart = moment().startOf("isoWeek").format("YYYY-MM-DD");
    dateEnd = moment().endOf("isoWeek").format("YYYY-MM-DD");
  } else if (cycle === "QUARTERLY") {
    dateStart = moment().startOf("quarter").format("YYYY-MM-DD");
    dateEnd = moment().endOf("quarter").format("YYYY-MM-DD");
  } else if (cycle === "SEMIANNUALLY") {
    const isFirstHalf = moment().month() < 6;
    if (isFirstHalf) {
      dateStart = moment().startOf("year").format("YYYY-MM-DD");
      dateEnd = moment().month(5).endOf("month").format("YYYY-MM-DD");
    } else {
      dateStart = moment().month(6).startOf("month").format("YYYY-MM-DD");
      dateEnd = moment().endOf("year").format("YYYY-MM-DD");
    }
  } else if (cycle === "YEARLY") {
    dateStart = moment().startOf("year").format("YYYY-MM-DD");
    dateEnd = moment().endOf("year").format("YYYY-MM-DD");
  }

  return { dateEnd, dateStart };
}
