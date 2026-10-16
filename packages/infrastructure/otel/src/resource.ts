import {
	envDetector,
	DetectedResourceAttributes, resourceFromAttributes
} from "@opentelemetry/resources";

export function createResource(opts?: DetectedResourceAttributes) {
	return resourceFromAttributes(
		Object.assign(
			envDetector.detect().attributes ?? {},
			opts ?? {},
		),
	);
}

