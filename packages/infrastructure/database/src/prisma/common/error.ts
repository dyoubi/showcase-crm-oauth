import { BadRequestException, NotFoundException } from "@egc-io/ckit-lib";
import {
	PrismaClientValidationError, PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError
} from "@prisma/client/runtime/library";

export type ErrorType<T extends Error = Error> = new (...args: any[]) => T;

export function PrismaError(error: Error): ErrorType {
	if (error instanceof PrismaClientValidationError) {
		return BadRequestException;
	}
	if (error instanceof PrismaClientKnownRequestError) {
		let codeNum = 0;
		if (error.code.toLowerCase().startsWith('p')) {
			codeNum = Number(error.code.slice(1));
		}

		if (isNaN(codeNum)) { return BadRequestException; }

		if (codeNum === 2001
			|| codeNum === 2015
			|| codeNum === 2025
		) { return NotFoundException; }

		if ((codeNum >= 2000 && codeNum <= 2030)
			|| codeNum === 2033
			|| codeNum === 2035
		) { return BadRequestException; }
	}
	if (error instanceof PrismaClientUnknownRequestError) {
		return Error;
	}
	return Error;
}