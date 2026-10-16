import { EmailStatus, EmailTask } from "./types";


export type EmailScheduleData = Omit<EmailTask, 'job_id' | 'status'> & { delay?: number; };
export type EmailScheduleResponse = { job_id: string, status: EmailStatus; };
export interface IEmailTaskProvider {
	/**
	 * create a job with provider data end return the job_id
	 * @param data 
	 * @param retries number of retries on error during job processing
	 * @returns unique job_id for the job
	 */
	schedule(data: EmailScheduleData, opts?: { retries?: number, delay?: number; }): Promise<EmailScheduleResponse>;
}
export const EMAIL_TASK_PROVIDER: symbol = Symbol('EMAIL_TASK_PROVIDER');