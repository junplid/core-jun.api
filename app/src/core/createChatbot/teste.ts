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
  indexTime: number;
}

// nome para a função que verifica se tem conflito nos dias de opreções

const conflict: Conflict[] = [];

// isso aqui ja funciona, só precisamos melhorar com função reutilizavel
for (const oldOperatingDay of oldOperating) {
  for (const newOperatingDay of newOperating) {
    if (newOperatingDay.dayOfWeek === oldOperatingDay.dayOfWeek) {
      const workTimeIsFull =
        !newOperatingDay.workingTimes?.length ||
        !oldOperatingDay.workingTimes?.length;
      if (workTimeIsFull) throw { message: "Conflito de `horário`" };

      for (
        let oldIndex = 0;
        oldIndex < oldOperatingDay.workingTimes!.length;
        oldIndex++
      ) {
        const oldTime = oldOperatingDay.workingTimes![oldIndex];
        for (
          let newIndex = 0;
          newIndex < newOperatingDay.workingTimes!.length;
          newIndex++
        ) {
          const newTime = newOperatingDay.workingTimes![oldIndex];
          const oldStart = getTimeBR(oldTime.start);
          const oldEnd = getTimeBR(oldTime.end);
          const newStart = getTimeBR(newTime.start);
          const newEnd = getTimeBR(newTime.end);

          if (moment(newEnd).isBefore(newStart)) {
            throw {
              message:
                "Horario invalido" +
                " " +
                newStart.format("HH:mm") +
                " " +
                newEnd.format("HH:mm"),
            };
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
              dayOfWeek: newOperatingDay.dayOfWeek,
              indexTime: newIndex,
            });
          }
        }
      }
    }
  }
}

console.log(conflict);
