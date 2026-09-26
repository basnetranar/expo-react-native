export interface CapturedError {
  name: string;
  message: string;
  stack: string | null;
  componentStack: string | null;
  timestamp: string;
}

export function captureError(error: Error, componentStack?: string | null): CapturedError {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack ?? null,
    componentStack: componentStack ?? null,
    timestamp: new Date().toISOString(),
  };
}
