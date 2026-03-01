import moment from "moment-timezone";

function getTimeBR(time: string) {
  return moment
    .tz("America/Sao_Paulo")
    .startOf("day")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

interface Conflict {
  dayOfWeek: number;
  indexTime?: number;
  text: string;
}

interface OperatingDay {
  dayOfWeek: number;
  workingTimes?: {
    start: string;
    end: string;
  }[];
}

export default function checkConflictOfOperatingDays(
  newOp: OperatingDay[],
  oldOp: OperatingDay[],
) {
  const conflict: Conflict[] = [];
  for (const oldDay of oldOp) {
    for (const newDay of newOp) {
      if (newDay.dayOfWeek === oldDay.dayOfWeek) {
        if (!newDay.workingTimes?.length || !oldDay.workingTimes?.length) {
          conflict.push({
            dayOfWeek: newDay.dayOfWeek,
            text: "Conflito de dia da semana com a conexão.",
          });
        }

        for (
          let oldIndex = 0;
          oldIndex < oldDay.workingTimes!.length;
          oldIndex++
        ) {
          const oldTime = oldDay.workingTimes![oldIndex];

          for (
            let newIndex = 0;
            newIndex < newDay.workingTimes!.length;
            newIndex++
          ) {
            const newTime = newDay.workingTimes![newIndex];
            const oldStart = getTimeBR(oldTime.start).utc();
            const oldEnd = getTimeBR(oldTime.end).utc();
            const newStart = getTimeBR(newTime.start).utc();
            const newEnd = getTimeBR(newTime.end).utc();

            if (moment(newEnd).isBefore(newStart)) {
              conflict.push({
                dayOfWeek: newDay.dayOfWeek,
                indexTime: newIndex,
                text: "Hora inválida",
              });
            }

            const isNewStartBettwen = newStart.isBetween(
              oldStart,
              oldEnd,
              undefined,
              "[]",
            );
            const isNewEndBettwen = newEnd.isBetween(
              oldStart,
              oldEnd,
              undefined,
              "[]",
            );
            const isOldStartBettwen = oldStart.isBetween(
              newStart,
              newEnd,
              undefined,
              "[]",
            );
            const isOldEndBettwen = oldEnd.isBetween(
              newStart,
              newEnd,
              undefined,
              "[]",
            );
            if (
              isNewStartBettwen ||
              isNewEndBettwen ||
              isOldStartBettwen ||
              isOldEndBettwen
            ) {
              conflict.push({
                dayOfWeek: newDay.dayOfWeek,
                indexTime: newIndex,
                text: "Conflito de horário com a conexão.",
              });
            }
          }
        }
      }
    }
  }
  return conflict;
}
