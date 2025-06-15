import { NodeAddTags } from "./AddTags";
import { NodeAddVariables } from "./AddVariables";
import { NodeAgentAI } from "./AgentAI";
import { NodeIf } from "./If";
import { NodeMenu } from "./Menu";
import { NodeMessage } from "./Message";
import { NodeNotifyWA } from "./NotifyWA";
import { NodeRemoveTags } from "./RemoveTags";
import { NodeRemoveVariables } from "./RemoveVariables";
import { NodeReply } from "./Reply";
import { NodeSendAudios } from "./SendAudios";
import { NodeSendAudiosLive } from "./SendAudiosLive";
import { NodeSendFiles } from "./SendFiles";
import { NodeSendFlow } from "./SendFlow";
import { NodeSendImages } from "./SendImages";
import { NodeSendVideos } from "./SendVideos";
import { NodeTimer } from "./Timer";
import { NodeTransferDepartment } from "./TransferDepartment";

export const LibraryNodes = {
  NodeReply,
  NodeMessage,
  NodeAddTags,
  NodeRemoveTags,
  NodeRemoveVariables,
  NodeAddVariables,
  NodeSendFlow,
  NodeIf,
  NodeTimer,
  NodeMenu,
  NodeNotifyWA,
  NodeSendFiles,
  NodeSendVideos,
  NodeSendImages,
  NodeSendAudiosLive,
  NodeSendAudios,
  NodeAgentAI,
  NodeTransferDepartment,
};
