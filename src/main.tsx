import { createRoot } from "react-dom/client";
import { Component, type ErrorInfo, type ReactNode } from "react";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: "red", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          <h1>App Error</h1>
          <pre>{this.state.error.message}</pre>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" not found');
}

const root = createRoot(rootElement);

const renderFatal = (error: unknown) => {
  const message = error instanceof Error ? `${error.message}\n\n${error.stack ?? ""}` : String(error);
  console.error("[Bootstrap Error]", error);
  root.render(
    <div style={{ padding: 40, color: "red", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <h1>Bootstrap Error</h1>
      <pre>{message}</pre>
    </div>
  );
};

window.addEventListener("error", (event) => {
  renderFatal(event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  renderFatal(event.reason);
});

import("./App.tsx")
  .then(({ default: App }) => {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  })
  .catch(renderFatal);
