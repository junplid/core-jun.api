import { NodeAction } from "./Action";
import { NodeCheckPoint } from "./CheckPoint";
import { NodeDistributeFlow } from "./DistributeFlow";
import { NodeEmailSending } from "./EmailSending";
import { NodeInsertLeaderInAudience } from "./InsertLeaderInAudience";
import { NodeInterruption } from "./Interruption";
import { NodeLinkTackingPixel } from "./LinkTackingPixel";
import { NodeLogicalCondition } from "./LogicalCondition";
import { NodeMathematicalOperators } from "./MathematicalOperators";
import { NodeMenu } from "./Menu";
import { NodeMessage } from "./Message";
import { NodeNewCardTrello } from "./NewCardTrello";
import { NodeNotifyNumber } from "./NotifyNumber";
import { NodeReply } from "./Reply";
import { NodeSendAudio } from "./SendAudio";
import { NodeSendContact } from "./SendContact";
import { NodeSendFile } from "./SendFile";
import { NodeSendHumanService } from "./SendHumanService";
import { NodeSendImage } from "./SendImage";
import { NodeSendLink } from "./SendLink";
import { NodeSendLocationGPS } from "./SendLocationGPS";
import { NodeSendPdf } from "./SendPdf";
import { NodeSendVideo } from "./SendVideo";
import { NodeSwitch } from "./Switch";
import { NodeTime } from "./Time";
import { NodeWebform } from "./Webform";
import { NodeWebhook } from "./Webhook";
import { NodeValidation } from "./Validation";
import { NodeAttendantAI } from "./AttendantAi";
import { NodeFacebookConversions } from "./FacebookConversions";

export const LibraryNodes = {
  NodeReply,
  NodeMessage,
  NodeMenu,
  NodeSwitch,
  NodeSendContact,
  NodeSendVideo,
  NodeSendPdf,
  NodeSendFile,
  NodeSendImage,
  NodeSendAudio,
  NodeSendLink,
  NodeSendLocationGPS,
  NodeMathematicalOperators,
  NodeDistributeFlow,
  NodeLogicalCondition,
  NodeCheckPoint,
  NodeInterruption,
  NodeAction,
  NodeNotifyNumber,
  NodeSendHumanService,
  NodeEmailSending,
  NodeLinkTackingPixel,
  NodeTime,
  NodeInsertLeaderInAudience,
  NodeWebhook,
  NodeWebform,
  NodeNewCardTrello,
  NodeValidation,
  NodeAttendantAI,
  NodeFacebookConversions,
};
