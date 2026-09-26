export type LogContext = Readonly<Record<string, unknown>>;
type Level = 'debug' | 'info' | 'warn' | 'error';

function write(level: Level, message: string, context?: LogContext): void {
  if (level === 'debug' && !__DEV__) return;
  const payload = context ? [message, context] : [message];
  if (level === 'error') console.error(...payload);
  else if (level === 'warn') console.warn(...payload);
  else if (__DEV__) console.log(`[${level}]`, ...payload);
}

export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    write('error', message, {
      ...context,
      error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    }),
};
