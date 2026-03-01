import moment from "moment-timezone";

export const resolveHourAndMinute = () => {
  const hour = moment()
    .tz("America/Sao_Paulo")
    .startOf("minute")
    .minutes(Math.floor(moment().tz("America/Sao_Paulo").minutes() / 5) * 5)
    .format("HH:mm");

  return hour;
};
