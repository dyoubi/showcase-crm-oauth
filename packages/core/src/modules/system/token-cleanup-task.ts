import { TaskManager } from "./types";

export interface ITokenCleanupTaskManager { };
export interface ITokenCleanupTaskManager extends TaskManager<ITokenCleanupTaskManager> { }
export const TOKEN_CLEANUP_TASK_MANAGER: symbol = Symbol("TOKEN_CLEANUP_TASK_MANAGER");
