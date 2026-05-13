import { createElement, type ReactElement } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  FileCheck2,
  FolderGit2,
  Gauge,
  GitBranch,
  Layers3,
  Loader2,
  LockKeyhole,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

import { cn } from '../../lib/utils';

export const uiLabIconMap = {
  alert: AlertTriangle,
  arrowRight: ArrowRight,
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  fileCheck: FileCheck2,
  folder: FolderGit2,
  gauge: Gauge,
  gitBranch: GitBranch,
  layers: Layers3,
  loading: Loader2,
  lock: LockKeyhole,
  pending: CircleDashed,
  search: SearchCheck,
  settings: Settings2,
  shield: ShieldCheck,
  sparkles: Sparkles,
} as const satisfies Record<string, LucideIcon>;

export type UiLabIconName = keyof typeof uiLabIconMap;

export interface UiLabIconProps extends Omit<LucideProps, 'ref'> {
  name: UiLabIconName;
  decorative?: boolean;
  label?: string;
}

export function UiLabIcon({
  name,
  className,
  decorative = true,
  label,
  ...props
}: UiLabIconProps): ReactElement {
  const iconComponent = uiLabIconMap[name];

  return createElement(iconComponent, {
    'aria-hidden': decorative ? true : undefined,
    'aria-label': !decorative ? (label ?? name) : undefined,
    role: !decorative ? 'img' : undefined,
    className: cn('size-4 shrink-0', name === 'loading' && 'animate-spin', className),
    ...props,
  });
}
