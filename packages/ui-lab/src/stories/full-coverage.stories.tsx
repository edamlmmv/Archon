import type { Meta, StoryObj } from '@storybook/react-vite';
import { Boxes, Database, FileJson, SearchCheck } from 'lucide-react';

import { Badge as UiBadge } from '@/components/ui/badge';
import { Button as UiButton } from '@/components/ui/button';
import {
  Card as UiCard,
  CardAction as UiCardAction,
  CardContent as UiCardContent,
  CardDescription as UiCardDescription,
  CardFooter as UiCardFooter,
  CardHeader as UiCardHeader,
  CardTitle as UiCardTitle,
} from '@/components/ui/card';
import {
  componentCoverageEntries,
  getComponentCoverageEntry,
  type ComponentCoverageId,
} from '@/metadata/component-coverage.generated';

const meta = {
  title: 'UI Lab/Full Coverage',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function VariantBadges({ values, family }: { values: readonly string[]; family: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label={`${family} variants`}>
      {values.map(value => (
        <UiBadge key={value} variant="outline">
          {family}:{value}
        </UiBadge>
      ))}
    </div>
  );
}

function CoverageCard({ componentId }: { componentId: ComponentCoverageId }) {
  const entry = getComponentCoverageEntry(componentId);
  return (
    <UiCard
      data-testid={entry.playwrightTestId}
      data-ui-component={entry.id}
      data-agentic-search="indexed"
      data-registry-item-path={entry.registryItemPath}
      data-storybook-story-id={entry.storybookStoryId}
      data-practice-profile-path={entry.practiceProfilePath}
      data-practice-evidence-path={entry.practiceEvidencePath}
      data-ui-ux-practices={entry.uiUxPractices.join(',')}
      data-variant-density={entry.variants.density.join(',')}
      data-variant-surface={entry.variants.surface.join(',')}
      data-variant-state={entry.variants.state.join(',')}
      data-variant-mode={entry.variants.mode.join(',')}
      className="max-w-3xl"
    >
      <UiCardHeader>
        <UiCardTitle>{entry.officialName}</UiCardTitle>
        <UiCardDescription>
          Generic shadcn registry component with bounded variant metadata, Playwright id, and Forge
          evidence refs.
        </UiCardDescription>
        <UiCardAction>
          <UiBadge>{entry.category}</UiBadge>
        </UiCardAction>
      </UiCardHeader>
      <UiCardContent className="grid gap-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Boxes className="size-4" aria-hidden="true" />
            <span>{entry.targetFile}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileJson className="size-4" aria-hidden="true" />
            <span>{entry.registryItemPath}</span>
          </div>
          <div className="flex items-center gap-2">
            <SearchCheck className="size-4" aria-hidden="true" />
            <span>Agentic Search indexed as advisory evidence.</span>
          </div>
          <div className="flex items-center gap-2">
            <SearchCheck className="size-4" aria-hidden="true" />
            <span>{entry.practiceProfilePath}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="UI/UX practices">
          {entry.uiUxPractices.map(practice => (
            <UiBadge key={practice} variant="outline">
              practice:{practice}
            </UiBadge>
          ))}
        </div>
        <div className="grid gap-3">
          <VariantBadges family="density" values={entry.variants.density} />
          <VariantBadges family="surface" values={entry.variants.surface} />
          <VariantBadges family="state" values={entry.variants.state} />
          <VariantBadges family="mode" values={entry.variants.mode} />
        </div>
        <div className="flex flex-wrap gap-2" aria-label="registry dependencies">
          {entry.registryDependencies.length > 0 ? (
            entry.registryDependencies.map(dependency => (
              <UiBadge key={dependency} variant="secondary">
                dep:{dependency}
              </UiBadge>
            ))
          ) : (
            <UiBadge variant="secondary">dep:none</UiBadge>
          )}
        </div>
      </UiCardContent>
      <UiCardFooter>
        <UiButton variant="outline" size="sm">
          <Database />
          {entry.playwrightTestId}
        </UiButton>
      </UiCardFooter>
    </UiCard>
  );
}

function makeCoverageStory(componentId: ComponentCoverageId): Story {
  const entry = getComponentCoverageEntry(componentId);
  return {
    name: entry.officialName,
    render: () => <CoverageCard componentId={componentId} />,
  };
}

export const AllComponents: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {componentCoverageEntries.map(entry => (
        <CoverageCard key={entry.id} componentId={entry.id} />
      ))}
    </div>
  ),
};

export const Accordion: Story = makeCoverageStory('accordion');
export const Alert: Story = makeCoverageStory('alert');
export const AlertDialog: Story = makeCoverageStory('alert-dialog');
export const AspectRatio: Story = makeCoverageStory('aspect-ratio');
export const Avatar: Story = makeCoverageStory('avatar');
export const Badge: Story = makeCoverageStory('badge');
export const Breadcrumb: Story = makeCoverageStory('breadcrumb');
export const Button: Story = makeCoverageStory('button');
export const ButtonGroup: Story = makeCoverageStory('button-group');
export const Calendar: Story = makeCoverageStory('calendar');
export const Card: Story = makeCoverageStory('card');
export const Carousel: Story = makeCoverageStory('carousel');
export const Chart: Story = makeCoverageStory('chart');
export const Checkbox: Story = makeCoverageStory('checkbox');
export const Collapsible: Story = makeCoverageStory('collapsible');
export const Combobox: Story = makeCoverageStory('combobox');
export const Command: Story = makeCoverageStory('command');
export const ContextMenu: Story = makeCoverageStory('context-menu');
export const DataTable: Story = makeCoverageStory('data-table');
export const DatePicker: Story = makeCoverageStory('date-picker');
export const Dialog: Story = makeCoverageStory('dialog');
export const Direction: Story = makeCoverageStory('direction');
export const Drawer: Story = makeCoverageStory('drawer');
export const DropdownMenu: Story = makeCoverageStory('dropdown-menu');
export const Empty: Story = makeCoverageStory('empty');
export const Field: Story = makeCoverageStory('field');
export const HoverCard: Story = makeCoverageStory('hover-card');
export const Input: Story = makeCoverageStory('input');
export const InputGroup: Story = makeCoverageStory('input-group');
export const InputOtp: Story = makeCoverageStory('input-otp');
export const Item: Story = makeCoverageStory('item');
export const Kbd: Story = makeCoverageStory('kbd');
export const Label: Story = makeCoverageStory('label');
export const Menubar: Story = makeCoverageStory('menubar');
export const NativeSelect: Story = makeCoverageStory('native-select');
export const NavigationMenu: Story = makeCoverageStory('navigation-menu');
export const Pagination: Story = makeCoverageStory('pagination');
export const Popover: Story = makeCoverageStory('popover');
export const Progress: Story = makeCoverageStory('progress');
export const RadioGroup: Story = makeCoverageStory('radio-group');
export const Resizable: Story = makeCoverageStory('resizable');
export const ScrollArea: Story = makeCoverageStory('scroll-area');
export const Select: Story = makeCoverageStory('select');
export const Separator: Story = makeCoverageStory('separator');
export const Sheet: Story = makeCoverageStory('sheet');
export const Sidebar: Story = makeCoverageStory('sidebar');
export const Skeleton: Story = makeCoverageStory('skeleton');
export const Slider: Story = makeCoverageStory('slider');
export const Sonner: Story = makeCoverageStory('sonner');
export const Spinner: Story = makeCoverageStory('spinner');
export const Switch: Story = makeCoverageStory('switch');
export const Table: Story = makeCoverageStory('table');
export const Tabs: Story = makeCoverageStory('tabs');
export const Textarea: Story = makeCoverageStory('textarea');
export const Toast: Story = makeCoverageStory('toast');
export const Toggle: Story = makeCoverageStory('toggle');
export const ToggleGroup: Story = makeCoverageStory('toggle-group');
export const Tooltip: Story = makeCoverageStory('tooltip');
export const Typography: Story = makeCoverageStory('typography');
