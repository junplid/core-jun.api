import moment from "moment-timezone";

function getTimeBR(time: string) {
  return moment()
    .tz("America/Sao_Paulo")
    .startOf("day")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

const newOperating = [
  {
    dayOfWeek: 0,
    workingTimes: [
      { start: "11:00", end: "10:00" },
      { start: "09:00", end: "12:00" },
    ],
  },
  {
    dayOfWeek: 1,
    workingTimes: [
      { start: "10:00", end: "14:00" },
      { start: "09:00", end: "12:00" },
    ],
  },
];

const oldOperating = [
  {
    dayOfWeek: 0,
    workingTimes: [{ start: "12:00", end: "20:00" }],
  },
];

interface Conflict {
  dayOfWeek: number;
  indexTime?: number;
  text: string;
}

// nome para a função que verifica se tem conflito nos dias de operações

interface OperatingDay {
  dayOfWeek: number;
  workingTimes: {
    start: string;
    end: string;
  }[];
}

function checkConflictOfOperatingDays(
  newOp: OperatingDay[],
  oldOp: OperatingDay[]
) {
  const conflict: Conflict[] = [];
  for (const oldDay of oldOp) {
    for (const newDay of newOp) {
      if (newDay.dayOfWeek === oldDay.dayOfWeek) {
        if (!newDay.workingTimes?.length || !oldDay.workingTimes?.length) {
          conflict.push({
            dayOfWeek: newDay.dayOfWeek,
            text: "Conflito de dia da semana",
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
            const newTime = newDay.workingTimes[newIndex];
            const oldStart = getTimeBR(oldTime.start);
            const oldEnd = getTimeBR(oldTime.end);
            const newStart = getTimeBR(newTime.start);
            const newEnd = getTimeBR(newTime.end);

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
              "[]"
            );
            const isNewEndBettwen = newEnd.isBetween(
              oldStart,
              oldEnd,
              undefined,
              "[]"
            );
            const isOldStartBettwen = oldStart.isBetween(
              newStart,
              newEnd,
              undefined,
              "[]"
            );
            const isOldEndBettwen = oldEnd.isBetween(
              newStart,
              newEnd,
              undefined,
              "[]"
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
                text: "Conflito de horário",
              });
            }
          }
        }
      }
    }
  }
  return conflict;
}

const check = checkConflictOfOperatingDays(newOperating, oldOperating);
console.log("check", check);
