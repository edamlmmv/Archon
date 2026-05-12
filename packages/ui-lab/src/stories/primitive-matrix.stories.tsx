import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronsUpDown,
  Command,
  ExternalLink,
  Loader2,
  Terminal,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const meta = {
  title: 'UI Lab/Primitive Matrix',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
] as const;
const BUTTON_SIZES = ['xs', 'sm', 'default', 'lg', 'icon'] as const;
const BADGE_VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
const DENSITIES = [
  { label: 'compact', className: 'gap-2 text-sm' },
  { label: 'default', className: 'gap-3' },
  { label: 'comfortable', className: 'gap-4 text-base' },
] as const;
const SURFACES = [
  { label: 'flat', className: 'bg-background shadow-none' },
  { label: 'outline', className: 'bg-background ring-1 ring-border-bright/70 shadow-none' },
  { label: 'elevated', className: 'bg-surface-elevated shadow-lg shadow-black/20' },
  { label: 'ghost', className: 'border-transparent bg-transparent shadow-none' },
] as const;
const STATE_ROWS = [
  { label: 'default', className: '', disabled: false, invalid: false },
  { label: 'focus', className: 'ring-2 ring-ring', disabled: false, invalid: false },
  { label: 'disabled', className: '', disabled: true, invalid: false },
  { label: 'invalid', className: '', disabled: false, invalid: true },
  { label: 'empty', className: '', disabled: false, invalid: false },
] as const;

export const ButtonMatrix: Story = {
  render: () => (
    <div className="space-y-5">
      {DENSITIES.map(density => (
        <section
          key={density.label}
          aria-label={`${density.label} buttons`}
          className={`flex flex-wrap items-center ${density.className}`}
        >
          {BUTTON_VARIANTS.map(variant => (
            <Button key={variant} variant={variant}>
              {variant === 'default' ? <Command /> : null}
              {variant}
            </Button>
          ))}
        </section>
      ))}
      <section aria-label="button sizes" className="flex flex-wrap items-center gap-3">
        {BUTTON_SIZES.map(size => (
          <Button key={size} size={size} aria-label={size === 'icon' ? 'Icon button' : undefined}>
            {size === 'icon' ? <Terminal /> : size}
          </Button>
        ))}
      </section>
      <section aria-label="button states" className="flex flex-wrap items-center gap-3">
        <Button disabled>disabled</Button>
        <Button aria-invalid>invalid</Button>
        <Button>
          <Loader2 className="animate-spin" />
          loading
        </Button>
      </section>
    </div>
  ),
};

export const BadgeMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {BADGE_VARIANTS.map(variant => (
        <Badge key={variant} variant={variant}>
          {variant === 'destructive' ? <AlertTriangle /> : <CheckCircle2 />}
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const CardSurfaces: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {SURFACES.map(surface => (
        <Card key={surface.label} className={surface.className}>
          <CardHeader>
            <CardTitle>{surface.label}</CardTitle>
            <CardDescription>Reusable card surface for dense operational UI.</CardDescription>
            <CardAction>
              <Badge variant="outline">ready</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              Panels keep content scannable without nesting decorative cards.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              Inspect
              <ExternalLink />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  ),
};

export const FormControls: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-4">
      {STATE_ROWS.map(state => (
        <label key={state.label} className="grid gap-2">
          <span className="text-sm font-medium">{state.label}</span>
          <Input
            aria-invalid={state.invalid}
            className={state.className}
            disabled={state.disabled}
            defaultValue={state.label === 'empty' ? '' : `archon-${state.label}`}
          />
        </label>
      ))}
      <Textarea
        aria-label="Prompt body"
        defaultValue="Use the UI lab primitives to compose page templates and validate every story."
      />
    </div>
  ),
};

export const DialogInteraction: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workflow run settings</DialogTitle>
          <DialogDescription>
            Review scoped settings before launching an agent workflow.
          </DialogDescription>
        </DialogHeader>
        <Input aria-label="Branch name" defaultValue="codex/ui-lab" />
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    await expect(await within(document.body).findByRole('dialog')).toBeInTheDocument();
  },
};

export const AlertDialogInteraction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Abandon run</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandon this workflow run?</AlertDialogTitle>
          <AlertDialogDescription>
            This keeps logs intact and marks the run as intentionally stopped.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Abandon</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Abandon run' }));
    await expect(await within(document.body).findByRole('alertdialog')).toBeInTheDocument();
  },
};

export const CollapsibleInteraction: Story = {
  render: () => (
    <Collapsible className="w-full max-w-xl rounded-md border border-border bg-surface-elevated p-4">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          Show route evidence
          <ChevronsUpDown />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 text-sm text-text-secondary">
        Storybook and Playwright are live MCP-backed checks. Radix and Tailwind are docs-backed
        capability claims.
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /show route evidence/i }));
    await expect(canvas.getByText(/docs-backed capability claims/i)).toBeVisible();
  },
};

export const TabsInteraction: Story = {
  render: () => (
    <Tabs defaultValue="components" className="w-full max-w-2xl">
      <TabsList>
        <TabsTrigger value="components">Components</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="tests">Tests</TabsTrigger>
      </TabsList>
      <TabsContent value="components" className="rounded-md border border-border p-4">
        Components include shadcn wrappers and Radix-backed primitives.
      </TabsContent>
      <TabsContent value="templates" className="rounded-md border border-border p-4">
        Templates compose reusable primitives into page-ready patterns.
      </TabsContent>
      <TabsContent value="tests" className="rounded-md border border-border p-4">
        Tests enumerate every story from Storybook index.json.
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Tests' }));
    await expect(canvas.getByText(/enumerate every story/i)).toBeVisible();
  },
};

export const ResizablePanels: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-72 max-w-4xl rounded-md border border-border"
    >
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className="flex h-full items-center justify-center bg-surface-inset p-4">Routes</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70} minSize={30}>
        <div className="flex h-full items-center justify-center bg-surface-elevated p-4">
          Evidence canvas
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ScrollAndSeparator: Story = {
  render: () => (
    <ScrollArea className="h-64 w-full max-w-xl rounded-md border border-border bg-surface-elevated">
      <div className="space-y-3 p-4">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index}>
            <div className="flex items-center justify-between">
              <span>Evidence row {index + 1}</span>
              <Badge variant="outline">checked</Badge>
            </div>
            {index < 11 ? <Separator className="mt-3" /> : null}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const TooltipInteraction: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover for tooltip</Button>
        </TooltipTrigger>
        <TooltipContent>Capability names are advisory until verified live.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('button', { name: 'Hover for tooltip' }));
    const tooltipText = await within(document.body).findAllByText(/advisory until verified live/i);
    await expect(tooltipText.length).toBeGreaterThan(0);
  },
};
