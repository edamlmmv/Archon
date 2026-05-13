import { createElement, type ReactElement } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, GitBranch, Play, ShieldCheck } from 'lucide-react';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';

export interface AgentCommandCenterTemplateProps {
  density?: 'compact' | 'default' | 'comfortable';
  surface?: 'flat' | 'outline' | 'elevated' | 'ghost';
}

const SURFACE_CLASS: Record<NonNullable<AgentCommandCenterTemplateProps['surface']>, string> = {
  flat: 'bg-background shadow-none',
  outline: 'bg-background shadow-none ring-1 ring-border-bright/70',
  elevated: 'bg-surface-elevated shadow-lg shadow-black/20',
  ghost: 'border-transparent bg-transparent shadow-none',
};

const DENSITY_CLASS: Record<NonNullable<AgentCommandCenterTemplateProps['density']>, string> = {
  compact: 'gap-3 text-sm',
  default: 'gap-4',
  comfortable: 'gap-6 text-base',
};

const RUN_ITEMS = [
  { label: 'Plan synthesis', status: 'done', icon: CheckCircle2 },
  { label: 'Tool leverage review', status: 'active', icon: Clock3 },
  { label: 'Browser validation', status: 'blocked', icon: AlertTriangle },
] as const;

export function AgentCommandCenterTemplate({
  density = 'default',
  surface = 'elevated',
}: AgentCommandCenterTemplateProps): ReactElement {
  return (
    <section
      data-testid="ui-lab-template:agent-command-center"
      data-template-id="agent-command-center"
      data-template-kind="agent-workflow-shell"
      data-registry-item-path="packages/ui-lab/registry/new-york/agent-command-center/registry-item.json"
      data-dependency-profile=".archon/bmad/ui-lab-dependency-map.json"
      className={`grid w-full max-w-6xl grid-cols-1 ${DENSITY_CLASS[density]} lg:grid-cols-[1.2fr_0.8fr]`}
    >
      <Card className={SURFACE_CLASS[surface]}>
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle>Agent Command Center</CardTitle>
          <CardDescription>Queue, route, and verify a focused agent run.</CardDescription>
          <CardAction>
            <Badge variant="secondary">
              <ShieldCheck />
              Guarded
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="brief">
            <TabsList>
              <TabsTrigger value="brief">Brief</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>
            <TabsContent value="brief" className="space-y-3 pt-3">
              <Input aria-label="Run title" defaultValue="UI stack capability lab" />
              <Textarea
                aria-label="Run prompt"
                defaultValue="Create variants, templates, and browser coverage for the reusable UI package."
              />
            </TabsContent>
            <TabsContent value="tools" className="grid gap-2 pt-3 sm:grid-cols-3">
              {['Storybook MCP', 'Playwright MCP', 'shadcn Registry'].map(toolName => (
                <Badge
                  key={toolName}
                  variant="outline"
                  className="justify-start rounded-md px-3 py-2"
                >
                  {toolName}
                </Badge>
              ))}
            </TabsContent>
            <TabsContent value="evidence" className="space-y-2 pt-3">
              {RUN_ITEMS.map(item => {
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      {createElement(item.icon, { className: 'size-4' })}
                      {item.label}
                    </span>
                    <Badge variant={item.status === 'blocked' ? 'destructive' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Play />
              Run workflow
            </Button>
            <Button variant="outline">
              <GitBranch />
              Create branch
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className={SURFACE_CLASS[surface]}>
        <CardHeader>
          <CardTitle>Validation Gates</CardTitle>
          <CardDescription>Each gate is explicit and reproducible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {['TypeScript strict', 'Storybook build', 'A11y scan', 'Browser matrix'].map(
            (gate, index) => (
              <div
                key={gate}
                className="flex items-center justify-between rounded-md bg-surface-inset px-3 py-2"
              >
                <span>{gate}</span>
                <Badge variant={index < 2 ? 'default' : 'outline'}>
                  {index < 2 ? 'ready' : 'queued'}
                </Badge>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </section>
  );
}
