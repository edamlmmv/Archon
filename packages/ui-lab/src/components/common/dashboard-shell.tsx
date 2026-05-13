import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/utils';

export interface DashboardShellProps extends ComponentProps<'section'> {
  title: string;
  updatedAtLabel?: ReactNode;
  summary?: ReactNode;
  feedback?: ReactNode;
}

export function DashboardShell({
  title,
  updatedAtLabel,
  summary,
  feedback,
  className,
  children,
  ...props
}: DashboardShellProps): ReactElement {
  return (
    <section
      data-slot="dashboard-shell"
      className={cn('flex min-w-0 flex-1 flex-col overflow-hidden', className)}
      {...props}
    >
      <div
        data-slot="dashboard-shell-scroll"
        className="min-w-0 flex-1 overflow-x-clip overflow-y-auto p-6"
        style={{ contain: 'layout paint' }}
      >
        <div data-slot="dashboard-shell-content" className="min-w-0 space-y-6">
          <header
            data-slot="dashboard-shell-header"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
            {updatedAtLabel ? (
              <div className="text-xs text-text-tertiary">{updatedAtLabel}</div>
            ) : null}
          </header>
          {summary ? <div data-slot="dashboard-shell-summary">{summary}</div> : null}
          {feedback ? <div data-slot="dashboard-shell-feedback">{feedback}</div> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
