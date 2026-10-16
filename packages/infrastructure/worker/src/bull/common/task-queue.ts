import { log } from '@egc-io/ckit-lib';
import { Queue, ConnectionOptions, Job, JobsOptions } from 'bullmq';
import { createHash, randomBytes } from 'crypto';

export class TaskQueue {
	protected $queue: Queue;
	protected $defaultJobOptions: JobsOptions;
	constructor(queueName: string, connection: ConnectionOptions, opts?: JobsOptions) {
		this.$queue = new Queue(queueName, { connection });
		this.$defaultJobOptions = {
			attempts: 3,
			backoff: 1_000,
			delay: opts?.delay,
			removeOnComplete: { age: 3600 * 24, count: 1_000 },
			removeOnFail: 1_000,
			...opts,
		};
		this.$queue.on('error', (error) => { log.error(error); });
	}

	protected async _schedule(
		queueName: string,
		data: object,
		opts?: JobsOptions
	) {
		const jobId = createHash('sha256')
			.update(randomBytes(16))
			.digest('hex');
		log.info('push new job in queue :', jobId);
		const jobData = Object.assign(data, { job_id: jobId });
		const response = await this.$queue.add(queueName, jobData, {
			...this.$defaultJobOptions,
			...opts ?? {},
			jobId,
		});
		return response;
	}

	async list(): Promise<string[]> {
		const jobList: Job[] = await this.$queue.getJobs(['active', 'paused', 'waiting']);
		return jobList.map(j => j.id ?? null).filter(v => v !== null);
	}

	async has(job_id: string): Promise<boolean> {
		const job: Job | undefined = await this.$queue.getJob(job_id);
		return (!!job);
	}

	async status(job_id: string): Promise<string> {
		const job: Job | undefined = await this.$queue.getJob(job_id);
		if (!job) { throw new ReferenceError(`job_id ${job_id} does not exists`); }
		const state = (await job.getState());
		return state;
	}

	async close() {
		const activeCount = await this.$queue.getActiveCount();
		if (activeCount) {
			log.warn(`closing bullmq connection while ${activeCount} job are active`);
		}
		await this.$queue.close();
	}
}