export interface JobResult {
	job_id: string;
	status: string;
}

export interface JobScheduleOptions { retries?: number, delay?: number; }

export interface TaskManager<DataType = any,
	ResultType extends JobResult = JobResult,
	OptionsType extends JobScheduleOptions = JobScheduleOptions
> {
	/**
 * List all pending or running job ids
 */
	list(): Promise<string[]>;
	/**
	 * Check in task queue if the pending job exists
	 * @param job_id job_id
	 */
	has(job_id: string): Promise<boolean>;

	/**
	 * Get the status of queued task
	 * @param job_id 
	 */
	status(job_id: string): Promise<string>;

	schedule(data: DataType, opts?: OptionsType): Promise<ResultType>;
}

export interface Contact {
	email: string;
	name?: string;
}

export interface Body {
	text?: string;
	html?: string;
}

export interface IAttachment {
	filename: string;
	content: string | Buffer;
	content_type?: string;
	content_disposition?: 'attachment' | 'inline';
	encoding?: string;
	cid?: string;
}

export interface IEmail {
	from: Contact;
	to: Contact[];
	cc?: Contact[];
	bcc?: Contact[];
	subject: string;
	body: Body;
	attachments?: IAttachment[];
	headers?: Record<string, string>;
}

export enum EmailStatus {
	PENDING = 'pending',
	DONE = 'done',
	RETRIES = 'retries',
	ERROR = 'error',
}

export class EmailTask {
	job_id: string;
	sender_id: string;
	foreign_id: string;
	email: IEmail;
	status: EmailStatus;
	retries?: number | null;
}
