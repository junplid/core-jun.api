import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { NodeTimerData } from "../Payload";

type PropsNodeTime = {
  data: NodeTimerData;
  nodeId?: string;
};

export const NodeTimer = (props: PropsNodeTime): Promise<boolean> =>
  new Promise(async (res, rej) => {
    const { type, value } = props.data;
    const nextTimeStart = moment().add(value, type[0]).toDate();
    await new Promise<void>((resJob) => {
      scheduleJob(nextTimeStart, () => resJob());
    }).then(() => res(true));
  });
