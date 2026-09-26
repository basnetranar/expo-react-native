import type { CapturedError } from '@/errors/errorTypes';
import { logger } from '@/logging/logger';

export function logCapturedError(error: CapturedError): void {
  logger.error('Unhandled React error.', new Error(error.message), {
    name: error.name,
    stack: error.stack,
    componentStack: error.componentStack,
    timestamp: error.timestamp,
  });
}
