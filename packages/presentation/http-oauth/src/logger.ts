import { ILogger } from "@egc-io/ckit-lib";
import { Logger, SeverityNumber } from "@ring-oauth/otel";
import { LogLevel } from "fastify";

export default class LoggerImpl implements ILogger {
	constructor(private readonly otel: Logger) { }
	_format(args: unknown[]): string {
		return args
			.map(v =>
				typeof v === "object" ?
					JSON.stringify(v)
					: `${v}`
			).join(' ');
	}
	debug(...args: unknown[]): void {
		this.otel.emit({ body: this._format(args), severityText: 'debug', severityNumber: SeverityNumber.DEBUG });
	}
	info(...args: unknown[]): void {
		this.otel.emit({ body: this._format(args), severityText: 'info', severityNumber: SeverityNumber.INFO });
	}
	trace(...args: unknown[]): void {
		this.otel.emit({ body: this._format(args), severityText: 'trace', severityNumber: SeverityNumber.TRACE });
	}
	warn(...args: unknown[]): void {
		this.otel.emit({ body: this._format(args), severityText: 'warn', severityNumber: SeverityNumber.WARN });
	}
	error(...args: unknown[]): void {
		this.otel.emit({ body: this._format(args), severityText: 'error', severityNumber: SeverityNumber.ERROR });
	}
	log(level: LogLevel, ...args: unknown[]): void {
		this.otel.emit({ body: this._format(args), severityText: level });
	}
}