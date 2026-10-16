import { Resource } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor, ConsoleLogRecordExporter,
	LoggerProvider, SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import {
	BatchSpanProcessor, NodeTracerProvider,
	SimpleSpanProcessor
} from "@opentelemetry/sdk-trace-node";
import { InstrumentationBase, registerInstrumentations } from "@opentelemetry/instrumentation";
import { RuntimeNodeInstrumentation } from "@opentelemetry/instrumentation-runtime-node";

import { createExporters } from "./exporter";
import { OpenTelemetryOpts } from "./types";

export type Instrumentation = {
	shutdown: () => void,
	tracerProvider: NodeTracerProvider,
	loggerProvider: LoggerProvider,
};

export const getInstruments = (
	resource: Resource,
	options: { optl: OpenTelemetryOpts; },
	instrumentations?: InstrumentationBase[],
): Instrumentation => {
	const exporters = createExporters({ otel: options.optl });
	const tracerProvider = new NodeTracerProvider({
		resource,
		spanProcessors: [
			new BatchSpanProcessor(exporters.trace),
			new SimpleSpanProcessor(exporters.console),
		]
	});
	tracerProvider.register();
	const loggerProvider = new LoggerProvider({
		resource,
		processors: [
			new BatchLogRecordProcessor(exporters.log),
			new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
		]
	});

	return {
		shutdown: registerInstrumentations({
			tracerProvider,
			loggerProvider,
			instrumentations: [
				new RuntimeNodeInstrumentation({ enabled: true, }),
				...(instrumentations ?? []),
			],
		}),
		tracerProvider,
		loggerProvider
	};
};