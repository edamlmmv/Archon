import { createElement, type ReactElement } from 'react';
import {
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  Gauge,
  GitPullRequest,
  TestTube2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface WorkflowReviewTemplateProps {
  density?: 'compact' | 'default' | 'comfortable';
  state?: 'default' | 'focus' | 'disabled' | 'invalid' | 'loading' | 'empty';
}

const DENSITY_PADDING: Record<NonNullable<WorkflowReviewTemplateProps['density']>, string> = {
  compact: 'p-3',
  default: 'p-4',
  comfortable: 'p-6',
};

const REVIEW_ITEMS = [
  {
    label: 'Package scaffold',
    detail: 'Workspace, exports, and TypeScript config',
    icon: FileCheck2,
  },
  { label: 'Component matrix', detail: 'All primitives represented in Storybook', icon: Gauge },
  {
    label: 'Playwright coverage',
    detail: 'Chromium, Firefox, WebKit story traversal',
    icon: TestTube2,
  },
] as const;

export function WorkflowReviewTemplate({
  density = 'default',
  state = 'default',
}: WorkflowReviewTemplateProps): ReactElement {
  const isDisabled = state === 'disabled';
  const statusLabel =
    state === 'loading'
      ? 'running'
      : state === 'invalid'
        ? 'attention'
        : state === 'empty'
          ? 'empty'
          : 'ready';

  return (
    <section className={`w-full max-w-5xl ${DENSITY_PADDING[density]}`}>
      <Card className="bg-surface-elevated">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>Workflow Review</CardTitle>
          <CardDescription>Review implementation evidence before a PR handoff.</CardDescription>
          <CardAction>
            <Badge variant={state === 'invalid' ? 'destructive' : 'secondary'}>{statusLabel}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4 pt-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-3">
            {REVIEW_ITEMS.map((item, index) => {
              return (
                <div
                  key={item.label}
                  className="rounded-md border border-border/70 bg-surface-inset p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-medium">
                      {createElement(item.icon, { className: 'size-4' })}
                      {item.label}
                    </span>
                    {index === 0 ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <CircleDashed className="size-4 text-warning" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{item.detail}</p>
                </div>
              );
            })}
          </div>
          <ScrollArea className="h-80 rounded-md border border-border/70 bg-background">
            <div className="space-y-4 p-4">
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between" disabled={isDisabled}>
                    Storybook evidence
                    <GitPullRequest className="size-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <p className="text-sm text-text-secondary">
                    Each primitive and template story must render without console errors and pass
                    axe scans.
                  </p>
                  <Separator />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {['dark', 'high contrast', 'reduced motion', 'responsive'].map(modeName => (
                      <Badge
                        key={modeName}
                        variant="outline"
                        className="justify-center rounded-md py-2"
                      >
                        {modeName}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}
