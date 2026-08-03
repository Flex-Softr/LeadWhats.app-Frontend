"use client";

import * as React from "react";

type Props = {
  children: React.ReactNode;
  /** Shown above the error details */
  label?: string;
};

type State = {
  error: Error | null;
};

/** Surfaces render errors instead of blanking the Base UI Dialog. */
export class AiPanelErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[bulk-campaign-dialog] render crashed", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-semibold">
            {this.props.label ?? "Something went wrong in this dialog."}
          </p>
          <p className="mt-2 font-mono text-xs opacity-90">
            {this.state.error.message}
          </p>
          <button
            type="button"
            className="mt-3 font-semibold underline underline-offset-2"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
