import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { cn } from '../../lib/utils';
import { StatusChip, type StatusChipTone } from './status-chip';

const formShellVariants = cva('w-full rounded-lg', {
  variants: {
    density: {
      compact: '[&_[data-slot=form-shell-content]]:gap-3 [&_[data-slot=form-shell-content]]:p-3',
      default: '[&_[data-slot=form-shell-content]]:gap-4 [&_[data-slot=form-shell-content]]:p-5',
      comfortable:
        '[&_[data-slot=form-shell-content]]:gap-6 [&_[data-slot=form-shell-content]]:p-6',
    },
    surface: {
      flat: 'bg-background shadow-none',
      outline: 'bg-background shadow-none ring-1 ring-border-bright/70',
      elevated: 'bg-surface-elevated shadow-lg shadow-black/20',
      ghost: 'border-transparent bg-transparent shadow-none',
    },
  },
  defaultVariants: {
    density: 'default',
    surface: 'elevated',
  },
});

export interface FormShellProps
  extends ComponentProps<'section'>, VariantProps<typeof formShellVariants> {
  title: string;
  description?: string;
  status?: ReactNode;
  footer?: ReactNode;
}

export function FormShell({
  title,
  description,
  status,
  footer,
  density = 'default',
  surface = 'elevated',
  className,
  children,
  ...props
}: FormShellProps): ReactElement {
  return (
    <section data-slot="form-shell" className={cn('w-full', className)} {...props}>
      <Card className={formShellVariants({ density, surface })}>
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
          {status ? <CardAction>{status}</CardAction> : null}
        </CardHeader>
        <CardContent data-slot="form-shell-content" className="grid">
          {children}
        </CardContent>
        {footer ? (
          <CardFooter className="border-t border-border/70 pt-4">{footer}</CardFooter>
        ) : null}
      </Card>
    </section>
  );
}

export function FormSection({ className, ...props }: ComponentProps<'div'>): ReactElement {
  return (
    <div
      data-slot="form-section"
      className={cn(
        'grid gap-4 rounded-md border border-border/70 bg-surface-inset p-4',
        className
      )}
      {...props}
    />
  );
}

export function FormRow({ className, ...props }: ComponentProps<'div'>): ReactElement {
  return (
    <div
      data-slot="form-row"
      className={cn('grid gap-3 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]', className)}
      {...props}
    />
  );
}

export function FormActions({ className, ...props }: ComponentProps<'div'>): ReactElement {
  return (
    <div
      data-slot="form-actions"
      className={cn('flex flex-wrap items-center justify-end gap-2', className)}
      {...props}
    />
  );
}

export interface FormSummaryProps extends ComponentProps<'div'> {
  tone?: StatusChipTone;
  label: string;
  detail?: string;
}

export function FormSummary({
  tone = 'neutral',
  label,
  detail,
  className,
  ...props
}: FormSummaryProps): ReactElement {
  return (
    <div
      data-slot="form-summary"
      className={cn(
        'flex flex-col gap-2 rounded-md border border-border/70 bg-background p-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <div className="font-medium">{label}</div>
        {detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}
      </div>
      <StatusChip tone={tone}>{label}</StatusChip>
    </div>
  );
}
