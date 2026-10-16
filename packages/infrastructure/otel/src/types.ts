export type OpenTelemetryOpts = {
	host: string,
	trace?: { endpoint?: string; };
	logs?: { endpoint?: string; };
	metrics?: { endpoint?: string; };
};

export { SeverityNumber, LogBody, LoggerOptions, Logger, LogAttributes, LogRecord } from '@opentelemetry/api-logs';
export {
	RawResourceAttribute,
	DetectedResourceAttributes,
	Resource,
	hostDetector, osDetector, envDetector,
	processDetector,
	defaultServiceName,
	resourceFromAttributes,
	serviceInstanceIdDetector,
	detectResources,
} from '@opentelemetry/resources';
export { diag } from '@opentelemetry/api';
export * as Semantic from "@opentelemetry/semantic-conventions";