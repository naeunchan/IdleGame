import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[app-error-boundary]', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-shell">
          <section className="error-card">
            <span className="label">Runtime Guard</span>
            <h1>개발견 스튜디오가 잠시 멈췄습니다.</h1>
            <p>예상치 못한 오류가 발생했습니다. 새로고침하면 자동 저장된 상태부터 다시 복구합니다.</p>
            <button className="error-card__button" onClick={this.handleReload} type="button">
              다시 열기
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

