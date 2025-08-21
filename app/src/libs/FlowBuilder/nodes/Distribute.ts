import { NodeDistributeData } from "../Payload";

interface PropsNodeDistribute {
  data: NodeDistributeData;
}

export const NodeDistribute = async (
  props: PropsNodeDistribute
): Promise<string> => {
  const randIndex = (Math.random() * props.data.exits.length) >> 0;
  return props.data.exits[randIndex].key;
};
