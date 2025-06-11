import { Job } from "node-schedule";

export const cacheFlowsMap = new Map<
  string,
  { nodes: any[]; edges: any[]; businessIds: number[] }
>();
export const leadAwaiting: Map<string, boolean> = new Map();
export const scheduleExecutionsReply: Map<string, Job | null> = new Map();
export const cacheJobsChatbotQueue: Map<number, boolean> = new Map();
export const scheduleExecutionsMenu: Map<string, Job | null> = new Map();
export const countAttemptsMenu: Map<string, number> = new Map();
export const cacheConnectionsWAOnline: Map<number, boolean> = new Map();
export const cacheFlowInExecution: Map<string, boolean> = new Map();
export const cacheTestAgentAI = new Map<string, string>();
