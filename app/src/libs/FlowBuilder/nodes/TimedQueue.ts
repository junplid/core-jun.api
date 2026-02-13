import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { NodeTimedQueueData } from "../Payload";
import { cacheDebounceTimedQueue } from "../../../adapters/Baileys/Cache";

type PropsNodeTime = {
  data: NodeTimedQueueData;
  nodeId: string;
  connectionId: number;
  numberLead: string;
  executeDebounce: () => void;
};

export const NodeTimedQueue = (props: PropsNodeTime): void => {
  const keyMap = `${props.connectionId} + ${props.numberLead} + ${props.nodeId}`;

  const timeDebounce = moment().add(props.data.value, "seconds").toDate();
  const debounce = cacheDebounceTimedQueue.get(keyMap);
  debounce?.cancel();
  cacheDebounceTimedQueue.delete(keyMap);

  const debounceJob = scheduleJob(timeDebounce, async () => {
    props.executeDebounce();
  });

  cacheDebounceTimedQueue.set(keyMap, debounceJob);
};
