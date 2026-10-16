import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { LogRecordExporter } from "@opentelemetry/sdk-logs";
import { PushMetricExporter } from "@opentelemetry/sdk-metrics";
import { ConsoleSpanExporter, SpanExporter } from "@opentelemetry/sdk-trace-node";
import { OpenTelemetryOpts } from "./types";

export type OptlExporters = {
	host: string;
	console: SpanExporter,
	trace: SpanExporter,
	log: LogRecordExporter,
	metrics: PushMetricExporter,
};

export function createExporters(options: { otel: OpenTelemetryOpts, }): OptlExporters {
	const host = String(options.otel.host);
	const console = new ConsoleSpanExporter();
	const trace = new OTLPTraceExporter({ url: `${host}/${options.otel.trace?.endpoint ?? 'traces'}`, });
	const log = new OTLPLogExporter({ url: `${host}/${options.otel.logs?.endpoint ?? 'logs'}`, });
	const metrics = new OTLPMetricExporter({ url: `${host}/${options.otel.metrics?.endpoint ?? 'metrics'}`, });
	return { host, console, trace, log, metrics, };
}