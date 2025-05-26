import { Job } from "node-schedule";

export const cacheFlowsMap = new Map<
  string,
  { nodes: any[]; edges: any[]; businessIds: number[] }
>();
export const leadAwaiting: Map<string, boolean> = new Map();
export const scheduleExecutionsReply: Map<string, Job | null> = new Map();
export const countAttemptsReply: Map<string, number> = new Map();
export const cacheJobsChatbotQueue: Map<number, boolean> = new Map();

/**
 * Cache com a lista execuções agendadas do bloco de menu
 * key = `{numero da conexão}+{numero do contato}`
 * #### return o JOB
 */
export const scheduleExecutionsMenu: Map<string, Job | null> = new Map();
export const countAttemptsMenu: Map<string, number> = new Map();

/**
 *  @example
 	```
	import { sequentialDistributeFlow } from '...';
    const nextExit = sequentialDistributeFlow.get("<campaignId>");
	```
 */
export const sequentialDistributeFlow: Map<string, string> = new Map();

/**
 *  @example
	```
	import { sequentialDistributeFlow } from '...';
    const nextExit = sequentialDistributeFlow.get("<campaignId>");
	```
 */
export const balancedDistributeFlow: Map<number, string> = new Map();

export const indexesCurrentLeadChatbot: Map<string, string> = new Map();

/**
 *  @example
	```
	import { cacheBaileys_SocketInReset } from '...';
    const botIsReset = cacheBaileys_SocketInReset.get(connectionId);
	```
 */

export const cacheConnectionsWAOnline: Map<number, boolean> = new Map();

export const cacheFlowInExecution: Map<string, boolean> = new Map();
