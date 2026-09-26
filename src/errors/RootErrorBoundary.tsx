import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

import { ErrorFallback } from '@/errors/ErrorFallback';
import { logCapturedError } from '@/errors/errorLogger';
import { captureError, type CapturedError } from '@/errors/errorTypes';

interface State {
  error: CapturedError | null;
}

export class RootErrorBoundary extends Component<PropsWithChildren, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error: captureError(error) };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    const captured = captureError(error, info.componentStack);
    this.setState({ error: captured });
    logCapturedError(captured);
  }

  private readonly retry = () => this.setState({ error: null });

  override render(): ReactNode {
    return this.state.error ? (
      <ErrorFallback error={this.state.error} onRetry={this.retry} />
    ) : (
      this.props.children
    );
  }
}
