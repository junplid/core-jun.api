import { remove } from "remove-accents";
import { NodeInterruptionData } from "../Payload";
import { currentNodeFlow } from "../cache";

interface PropsNodeInterruption {
  data: NodeInterruptionData[];
  message: string;
  connectionWhatsId: number;
  contactsWAOnAccountId: number;
  // nodeId: string;
}

type ResultPromise = { handleId?: string };

export const NodeInterruption = (
  props: PropsNodeInterruption
): Promise<ResultPromise> =>
  new Promise(async (res, rej) => {
    const { message, data } = props;
    try {
      for await (const { items } of data) {
        for await (const item of items) {
          const handleFind = item.activators.find(
            (ac) =>
              remove(ac.value.toLowerCase()) === remove(message.toLowerCase())
          );
          if (handleFind) return res({ handleId: item.key });
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  });
