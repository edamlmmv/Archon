import type { ComponentProps, ReactElement } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { UiLabIcon, type UiLabIconName } from '../icons/ui-lab-icons';

const statusChipVariants = cva('inline-flex items-center gap-1.5 rounded-md border px-2 py-1', {
  variants: {
    tone: {
      neutral: 'border-border bg-secondary text-secondary-foreground',
      success: 'border-success/35 bg-success/10 text-success',
      warning: 'border-warning/35 bg-warning/10 text-warning',
      danger: 'border-destructive/70 bg-destructive/25 text-foreground',
      info: 'border-primary/35 bg-primary/10 text-primary',
      loading: 'border-border bg-muted text-muted-foreground',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});

export type StatusChipTone = NonNullable<VariantProps<typeof statusChipVariants>['tone']>;

const defaultStatusIcons = {
  neutral: 'pending',
  success: 'check',
  warning: 'alert',
  danger: 'alert',
  info: 'search',
  loading: 'loading',
} as const satisfies Record<StatusChipTone, UiLabIconName>;

export interface StatusChipProps
  extends Omit<ComponentProps<typeof Badge>, 'variant'>, VariantProps<typeof statusChipVariants> {
  icon?: UiLabIconName | false;
}

export function StatusChip({
  tone = 'neutral',
  icon,
  className,
  children,
  ...props
}: StatusChipProps): ReactElement {
  const resolvedTone: StatusChipTone = tone ?? 'neutral';
  const iconName = icon === false ? null : (icon ?? defaultStatusIcons[resolvedTone]);

  return (
    <Badge
      data-slot="status-chip"
      data-tone={resolvedTone}
      className={cn(statusChipVariants({ tone: resolvedTone }), className)}
      {...props}
    >
      {iconName ? <UiLabIcon name={iconName} /> : null}
      {children}
    </Badge>
  );
}
