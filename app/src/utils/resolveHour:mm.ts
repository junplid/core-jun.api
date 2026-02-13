import moment from "moment-timezone";

export const resolveHourAndMinute = () => {
  const date = moment().tz("America/Sao_Paulo");
  const minutes = date.minutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;
  const hour = date
    .clone()
    .minutes(roundedMinutes)
    .seconds(0)
    .milliseconds(0)
    .format("HH:mm");

  return hour;
};
