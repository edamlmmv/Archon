import type { ReactElement, ReactNode } from 'react';
import {
  ArrowRight,
  ClipboardCheck,
  Database,
  FileCheck2,
  FolderGit2,
  GitBranch,
  Layers3,
  ListChecks,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Table2,
  TerminalSquare,
} from 'lucide-react';

import { FormActions, FormRow, FormSection, FormShell } from '../components/common/form-layout';
import { StatusChip, type StatusChipTone } from '../components/common/status-chip';
import { Button } from '../components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '../components/ui/command';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../lib/utils';

export interface ProductizationTemplateProps {
  density?: 'compact' | 'default' | 'comfortable';
  surface?: 'flat' | 'outline' | 'elevated' | 'ghost';
  state?: 'default' | 'focus' | 'disabled' | 'invalid' | 'loading' | 'empty';
  mode?: 'dark' | 'high-contrast' | 'reduced-motion' | 'responsive';
}

const densityClass: Record<NonNullable<ProductizationTemplateProps['density']>, string> = {
  compact: 'gap-3 p-3 text-sm',
  default: 'gap-4 p-5',
  comfortable: 'gap-6 p-6 text-base',
};

const surfaceClass: Record<NonNullable<ProductizationTemplateProps['surface']>, string> = {
  flat: 'bg-background shadow-none',
  outline: 'bg-background shadow-none ring-1 ring-border-bright/70',
  elevated: 'bg-surface-elevated shadow-lg shadow-black/20',
  ghost: 'border-transparent bg-transparent shadow-none',
};

const modeClass: Record<NonNullable<ProductizationTemplateProps['mode']>, string> = {
  dark: 'bg-background text-foreground',
  'high-contrast': 'contrast-125',
  'reduced-motion': '[&_*]:transition-none [&_*]:animate-none',
  responsive: '',
};

function stateTone(state: NonNullable<ProductizationTemplateProps['state']>): StatusChipTone {
  if (state === 'invalid') return 'danger';
  if (state === 'loading') return 'loading';
  if (state === 'empty') return 'warning';
  if (state === 'focus') return 'info';
  return 'success';
}

function Shell({
  id,
  kind,
  title,
  description,
  icon,
  density = 'default',
  surface = 'elevated',
  state = 'default',
  mode = 'responsive',
  children,
}: ProductizationTemplateProps & {
  id: string;
  kind: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <section
      data-testid={`ui-lab-template:${id}`}
      data-template-id={id}
      data-template-kind={kind}
      data-registry-item-path={`packages/ui-lab/registry/new-york/${id}/registry-item.json`}
      data-dependency-profile=".archon/bmad/ui-lab-dependency-map.json"
      data-productization-queue=".archon/bmad/ui-lab-productization.queue.json"
      data-variant-density={density}
      data-variant-surface={surface}
      data-variant-state={state}
      data-variant-mode={mode}
      className={cn('mx-auto grid w-full max-w-6xl', densityClass[density], modeClass[mode])}
    >
      <Card className={surfaceClass[surface]}>
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>
            <StatusChip tone={stateTone(state)}>{state === 'default' ? 'ready' : state}</StatusChip>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">{children}</CardContent>
      </Card>
    </section>
  );
}

function MetricRow({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: StatusChipTone;
}): ReactElement {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-surface-inset px-3 py-2">
      <span className="min-w-0 truncate text-sm text-muted-foreground">{label}</span>
      <StatusChip tone={tone}>{value}</StatusChip>
    </div>
  );
}

export function DashboardShellTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <Shell
      {...props}
      id="dashboard-shell"
      kind="dashboard-shell"
      title="Workflow Dashboard"
      description="Operational shell for active runs, filters, and health signals."
      icon={<ShieldCheck className="size-4" />}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MetricRow label="Active" value="4" tone="info" />
        <MetricRow label="Queued" value="9" tone="warning" />
        <MetricRow label="Passed" value="42" tone="success" />
        <MetricRow label="Blocked" value="1" tone="danger" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="grid gap-2">
          {['All projects', 'Running', 'Needs approval', 'Failed'].map(filter => (
            <Button key={filter} variant="outline" className="justify-start">
              <ListChecks className="size-4" />
              {filter}
            </Button>
          ))}
        </div>
        <div className="grid gap-3">
          {['Plan to PR', 'UI-lab productization', 'Maintainer review'].map((name, index) => (
            <div key={name} className="rounded-md border border-border/70 bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{name}</span>
                <StatusChip tone={index === 1 ? 'loading' : 'success'}>
                  {index === 1 ? 'running' : 'ready'}
                </StatusChip>
              </div>
              <Progress
                aria-label={`${name} progress`}
                value={index === 1 ? 63 : 100}
                className="mt-3"
              />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function ProjectSettingsFormTemplate(props: ProductizationTemplateProps): ReactElement {
  const disabled = props.state === 'disabled' || props.state === 'loading';
  return (
    <FormShell
      data-testid="ui-lab-template:project-settings-form"
      data-template-id="project-settings-form"
      data-template-kind="project-settings-form"
      data-registry-item-path="packages/ui-lab/registry/new-york/project-settings-form/registry-item.json"
      data-dependency-profile=".archon/bmad/ui-lab-dependency-map.json"
      data-productization-queue=".archon/bmad/ui-lab-productization.queue.json"
      data-variant-density={props.density ?? 'default'}
      data-variant-surface={props.surface ?? 'elevated'}
      data-variant-state={props.state ?? 'default'}
      data-variant-mode={props.mode ?? 'responsive'}
      title="Project Settings"
      description="Reusable project registration and default assistant form."
      density={props.density ?? 'default'}
      surface={props.surface ?? 'elevated'}
      status={
        <StatusChip tone={stateTone(props.state ?? 'default')}>{props.state ?? 'ready'}</StatusChip>
      }
      className="mx-auto max-w-5xl"
    >
      <FormSection>
        <FormRow>
          <div>
            <h3 className="font-medium">Repository</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Stable repo context for generated workflows.
            </p>
          </div>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              Project name
              <Input disabled={disabled} defaultValue="Archon UI productization" />
            </label>
            <label className="grid gap-1 text-sm">
              Repository path
              <Input disabled={disabled} defaultValue="/Users/example/Archon" />
            </label>
          </div>
        </FormRow>
      </FormSection>
      <FormSection>
        <FormRow>
          <div>
            <h3 className="font-medium">Execution defaults</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Provider and branch settings remain explicit.
            </p>
          </div>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              Default branch
              <Input disabled={disabled} defaultValue="dev" />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border/70 p-3 text-sm">
              Require validation before handoff
              <Switch disabled={disabled} defaultChecked />
            </label>
          </div>
        </FormRow>
      </FormSection>
      <FormActions>
        <Button disabled={disabled} variant="outline">
          Cancel
        </Button>
        <Button disabled={disabled}>Save project</Button>
      </FormActions>
    </FormShell>
  );
}

export function EnvironmentVariablesFormTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <FormShell
      data-testid="ui-lab-template:environment-variables-form"
      data-template-id="environment-variables-form"
      data-template-kind="environment-variables-form"
      data-registry-item-path="packages/ui-lab/registry/new-york/environment-variables-form/registry-item.json"
      data-dependency-profile=".archon/bmad/ui-lab-dependency-map.json"
      data-productization-queue=".archon/bmad/ui-lab-productization.queue.json"
      data-variant-density={props.density ?? 'default'}
      data-variant-surface={props.surface ?? 'elevated'}
      data-variant-state={props.state ?? 'default'}
      data-variant-mode={props.mode ?? 'responsive'}
      title="Environment Variables"
      description="Secret-safe variable editor pattern with masked values and explicit actions."
      density={props.density ?? 'default'}
      surface={props.surface ?? 'elevated'}
      status={<StatusChip tone="info">masked</StatusChip>}
      className="mx-auto max-w-4xl"
    >
      <div className="grid gap-3">
        {['OPENAI_API_KEY', 'GITHUB_TOKEN', 'DATABASE_URL'].map((key, index) => (
          <div
            key={key}
            className="grid gap-2 rounded-md border border-border/70 bg-surface-inset p-3 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div className="min-w-0">
              <div className="truncate font-mono text-sm">{key}</div>
              <div className="text-sm text-muted-foreground">
                {index === 2 ? 'unset' : 'set, hidden'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm" variant="ghost">
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Separator />
      <FormActions>
        <Input aria-label="New variable key" placeholder="NEW_VARIABLE" className="max-w-xs" />
        <Button>
          <Plus className="size-4" />
          Add variable
        </Button>
      </FormActions>
    </FormShell>
  );
}

export function WorkflowBuilderShellTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <Shell
      {...props}
      id="workflow-builder-shell"
      kind="workflow-builder-shell"
      title="Workflow Builder"
      description="Graph builder shell with palette, canvas, inspector, and validation slots."
      icon={<Layers3 className="size-4" />}
    >
      <div className="grid min-h-96 gap-4 lg:grid-cols-[220px_1fr_260px]">
        <div className="grid content-start gap-2 rounded-md border border-border/70 bg-surface-inset p-3">
          {['Prompt', 'Bash', 'Script', 'Approval'].map(node => (
            <Button key={node} variant="outline" className="justify-start">
              <Plus className="size-4" />
              {node}
            </Button>
          ))}
        </div>
        <div className="grid place-items-center rounded-md border border-dashed border-border-bright bg-background p-6">
          <div className="grid gap-3 text-center">
            <GitBranch className="mx-auto size-8 text-muted-foreground" />
            <div className="font-medium">DAG canvas</div>
            <div className="text-sm text-muted-foreground">
              Drop nodes, connect edges, inspect validation.
            </div>
          </div>
        </div>
        <div className="grid content-start gap-3 rounded-md border border-border/70 bg-surface-inset p-3">
          <label className="grid gap-1 text-sm">
            Node id
            <Input defaultValue="validate-ui-lab" />
          </label>
          <label className="grid gap-1 text-sm">
            Prompt
            <Textarea defaultValue="Run UI-lab productization gate." />
          </label>
        </div>
      </div>
    </Shell>
  );
}

export function WorkflowExecutionReviewTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <Shell
      {...props}
      id="workflow-execution-review"
      kind="workflow-execution-review"
      title="Execution Review"
      description="Run detail template for nodes, logs, artifacts, approvals, and validation."
      icon={<FileCheck2 className="size-4" />}
    >
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-3">
          {['intake', 'template-buildout', 'forge-sync', 'final-gate'].map((node, index) => (
            <div key={node} className="rounded-md border border-border/70 bg-surface-inset p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{node}</span>
                <StatusChip tone={index < 2 ? 'success' : index === 2 ? 'loading' : 'neutral'}>
                  {index < 2 ? 'passed' : index === 2 ? 'running' : 'queued'}
                </StatusChip>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-border/70 bg-background p-3">
          <div className="mb-3 flex items-center gap-2 font-medium">
            <TerminalSquare className="size-4" />
            Validation log
          </div>
          <pre className="overflow-x-auto rounded-md bg-surface-inset p-3 text-xs">
            UI_LAB_VALID{'\n'}registry:build passed{'\n'}Storybook evidence indexed
          </pre>
        </div>
      </div>
    </Shell>
  );
}

export function CommandPaletteFlowTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <Shell
      {...props}
      id="command-palette-flow"
      kind="command-palette-flow"
      title="Command Palette Flow"
      description="Search-first command surface for workflows, projects, evidence, and templates."
      icon={<Search className="size-4" />}
    >
      <Command className="rounded-md border border-border/70">
        <CommandInput aria-label="Search commands" placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No command found.</CommandEmpty>
          <CommandGroup heading="Workflows">
            {['Run UI-lab productization', 'Open Forge evidence', 'Create PR handoff'].map(
              (item, index) => (
                <CommandItem key={item}>
                  <Play className="size-4" />
                  {item}
                  <CommandShortcut>{index === 0 ? 'Cmd R' : 'Cmd K'}</CommandShortcut>
                </CommandItem>
              )
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </Shell>
  );
}

export function DataTableWorkspaceTemplate(props: ProductizationTemplateProps): ReactElement {
  const rows = [
    ['dashboard-shell', 'template', 'forge-ready'],
    ['settings-form-workspace', 'template', 'forge-ready'],
    ['web-ui-wrapper-adoption', 'web-adoption', 'forge-ready'],
  ] as const;
  return (
    <Shell
      {...props}
      id="data-table-workspace"
      kind="data-table-workspace"
      title="Data Table Workspace"
      description="Reusable table workspace for queues, evidence, dependencies, and audit output."
      icon={<Table2 className="size-4" />}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input aria-label="Filter rows" placeholder="Filter queue items" className="max-w-xs" />
        <Button variant="outline">Export evidence</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row[0]}>
              <TableCell className="font-medium">{row[0]}</TableCell>
              <TableCell>{row[1]}</TableCell>
              <TableCell>
                <StatusChip tone="success">{row[2]}</StatusChip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Shell>
  );
}

export function OnboardingEmptyStateTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <Shell
      {...props}
      id="onboarding-empty-state"
      kind="onboarding-empty-state"
      title="Onboarding"
      description="Empty state pattern for first project, first workflow, or missing evidence."
      icon={<FolderGit2 className="size-4" />}
    >
      <div className="grid place-items-center rounded-md border border-dashed border-border-bright bg-background p-10 text-center">
        <div className="grid max-w-md gap-3">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <div className="text-lg font-semibold">No workflows yet</div>
          <p className="text-sm text-muted-foreground">
            Register a project, choose a BMAD route, then run a guarded workflow with evidence.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button>
              Register project
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline">View templates</Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function ModalDrawerCrudTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <Shell
      {...props}
      id="modal-drawer-crud"
      kind="modal-drawer-crud"
      title="CRUD Review"
      description="Modal and drawer style CRUD layout without app-specific state ownership."
      icon={<ClipboardCheck className="size-4" />}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border/70 bg-background p-4">
          <div className="mb-3 font-medium">Edit capability</div>
          <div className="grid gap-3">
            <Input aria-label="Capability name" defaultValue="UI-lab productization" />
            <Textarea
              aria-label="Capability summary"
              defaultValue="Registry-backed template evidence."
            />
            <FormActions>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </FormActions>
          </div>
        </div>
        <div className="rounded-md border border-border/70 bg-surface-inset p-4">
          <div className="mb-3 font-medium">Review drawer</div>
          <div className="grid gap-2">
            {['Registry item valid', 'Forge evidence linked', 'Playwright proof present'].map(
              check => (
                <StatusChip key={check} tone="success">
                  {check}
                </StatusChip>
              )
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function SidebarAppShellTemplate(props: ProductizationTemplateProps): ReactElement {
  return (
    <Shell
      {...props}
      id="sidebar-app-shell"
      kind="sidebar-app-shell"
      title="Sidebar App Shell"
      description="Application shell with sidebar navigation, top actions, and content region."
      icon={<Layers3 className="size-4" />}
    >
      <div className="grid min-h-96 overflow-hidden rounded-md border border-border/70 lg:grid-cols-[240px_1fr]">
        <div
          aria-label="Sidebar navigation"
          className="grid content-start gap-2 border-b border-border/70 bg-surface-inset p-3 lg:border-r lg:border-b-0"
        >
          {['Dashboard', 'Workflows', 'Projects', 'Settings'].map((item, index) => (
            <Button
              key={item}
              variant={index === 0 ? 'secondary' : 'ghost'}
              className="justify-start"
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="grid content-start gap-4 bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">UI-lab workspace</div>
              <div className="text-sm text-muted-foreground">
                Template-ready shell for repeated app layouts.
              </div>
            </div>
            <Button size="sm">New run</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="rounded-md border border-border/70 p-4">
            <Database className="mb-2 size-5 text-muted-foreground" />
            <div className="font-medium">Content slot</div>
            <div className="text-sm text-muted-foreground">
              Route data renders here in consuming apps.
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
