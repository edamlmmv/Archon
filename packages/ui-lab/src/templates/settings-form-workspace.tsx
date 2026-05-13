import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod/v4';

import {
  FormActions,
  FormRow,
  FormSection,
  FormShell,
  FormSummary,
} from '../components/common/form-layout';
import { StatusChip } from '../components/common/status-chip';
import { UiLabIcon } from '../components/icons/ui-lab-icons';
import { Button } from '../components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { useDisclosure } from '../hooks/use-disclosure';
import { useFormProgress } from '../hooks/use-form-progress';

const settingsFormSchema = z.object({
  workspaceName: z.string().min(2, 'Use at least 2 characters.'),
  defaultBranch: z.string().min(1, 'Default branch is required.'),
  validationMode: z.enum(['focused', 'full', 'release']),
  evidencePolicy: z.string().min(12, 'Describe evidence policy.'),
  forgeMetadata: z.boolean(),
  agenticSearch: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const settingsFormResolver: Resolver<SettingsFormValues> = async values => {
  const parsed = settingsFormSchema.safeParse(values);

  if (parsed.success) {
    return {
      values: parsed.data,
      errors: {},
    };
  }

  return {
    values: {},
    errors: Object.fromEntries(
      parsed.error.issues.map(issue => [
        String(issue.path[0]),
        {
          type: issue.code,
          message: issue.message,
        },
      ])
    ),
  };
};

export interface SettingsFormWorkspaceTemplateProps {
  density?: 'compact' | 'default' | 'comfortable';
  surface?: 'flat' | 'outline' | 'elevated' | 'ghost';
  state?: 'default' | 'focus' | 'disabled' | 'invalid' | 'loading' | 'empty';
  defaultValues?: Partial<SettingsFormValues>;
  onSubmit?: (values: SettingsFormValues) => void | Promise<void>;
}

const defaultSettingsValues = {
  workspaceName: 'UI-lab capability pack',
  defaultBranch: 'dev',
  validationMode: 'focused',
  evidencePolicy: 'Registry metadata, Storybook variants, Playwright runs, and Forge evidence.',
  forgeMetadata: true,
  agenticSearch: true,
} as const satisfies SettingsFormValues;

const requiredSettingsKeys = [
  'workspaceName',
  'defaultBranch',
  'validationMode',
  'evidencePolicy',
] as const satisfies readonly (keyof SettingsFormValues)[];

function stateTone(
  state: NonNullable<SettingsFormWorkspaceTemplateProps['state']>,
  isValid: boolean
): 'success' | 'warning' | 'danger' | 'loading' | 'neutral' {
  if (state === 'loading') return 'loading';
  if (state === 'invalid' || !isValid) return 'danger';
  if (state === 'empty') return 'warning';
  if (state === 'disabled') return 'neutral';
  return 'success';
}

export function SettingsFormWorkspaceTemplate({
  density = 'default',
  surface = 'elevated',
  state = 'default',
  defaultValues,
  onSubmit,
}: SettingsFormWorkspaceTemplateProps): ReactElement {
  const [lastSavedWorkspace, setLastSavedWorkspace] = useState<string | null>(null);
  const advanced = useDisclosure({ defaultOpen: state === 'focus' });
  const mergedDefaults = useMemo(
    () => ({
      ...defaultSettingsValues,
      ...defaultValues,
      ...(state === 'empty'
        ? {
            workspaceName: '',
            evidencePolicy: '',
          }
        : {}),
      ...(state === 'invalid'
        ? {
            workspaceName: 'x',
            evidencePolicy: 'short',
          }
        : {}),
    }),
    [defaultValues, state]
  );
  const form = useForm<SettingsFormValues>({
    resolver: settingsFormResolver,
    defaultValues: mergedDefaults,
    mode: 'onChange',
  });
  const watchedValues = form.watch();
  const progress = useFormProgress(watchedValues, requiredSettingsKeys);
  const disabled = state === 'disabled' || state === 'loading';
  const tone = stateTone(state, form.formState.isValid);
  const submit = form.handleSubmit(values => {
    setLastSavedWorkspace(values.workspaceName);
    void onSubmit?.(values);
  });

  return (
    <FormShell
      data-testid="ui-lab-template:settings-form-workspace"
      data-template-id="settings-form-workspace"
      data-template-kind="form-workspace"
      data-registry-item-path="packages/ui-lab/registry/new-york/settings-form-workspace/registry-item.json"
      data-ui-ux-practices="accessibility-first-interactions,bounded-variant-matrix,semantic-theme-tokens,responsive-layout-integrity,state-complete-surfaces,composition-ready-slots"
      data-dependency-profile=".archon/bmad/ui-lab-dependency-map.json"
      title="Workspace Settings"
      description="Generic form shell for configuring reusable workflow and Forge inputs."
      density={density}
      surface={surface}
      status={
        <StatusChip tone={tone}>
          {state === 'loading' ? 'saving' : `${progress.percent}%`}
        </StatusChip>
      }
      className="mx-auto max-w-5xl"
    >
      <Form {...form}>
        <form className="grid gap-4" onSubmit={event => void submit(event)}>
          <FormSummary
            tone={tone}
            label={`${progress.completed} of ${progress.total} required fields complete`}
            detail={
              progress.missingKeys.length > 0
                ? `Missing: ${progress.missingKeys.join(', ')}`
                : 'Template-ready settings can be resolved by Forge without source inspection.'
            }
          />

          <FormSection>
            <FormRow>
              <div>
                <h3 className="font-medium">Project Identity</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stable names and branches keep generated templates reproducible.
                </p>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="workspaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace name</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon>
                            <UiLabIcon name="folder" />
                          </InputGroupAddon>
                          <InputGroupInput
                            aria-label="Workspace name"
                            disabled={disabled}
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormDescription>
                        Visible title used in template and evidence outputs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default branch</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon>
                            <UiLabIcon name="gitBranch" />
                          </InputGroupAddon>
                          <InputGroupInput
                            aria-label="Default branch"
                            disabled={disabled}
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormRow>

            <Separator />

            <FormRow>
              <div>
                <h3 className="font-medium">Validation Mode</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick focused checks for local iteration, full checks for PR handoff.
                </p>
              </div>
              <FormField
                control={form.control}
                name="validationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select disabled={disabled} onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full" aria-label="Validation mode">
                          <SelectValue placeholder="Select validation mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="focused">Focused component checks</SelectItem>
                        <SelectItem value="full">Full repo validation</SelectItem>
                        <SelectItem value="release">Release gate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Forge records selected mode as template policy.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormRow>
          </FormSection>

          <FormSection>
            <Collapsible open={advanced.open} onOpenChange={advanced.setOpen}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Evidence Controls</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep discovery metadata advisory and registry evidence authoritative.
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <UiLabIcon name="settings" />
                    {advanced.open ? 'Hide controls' : 'Show controls'}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="grid gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="evidencePolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence policy</FormLabel>
                      <FormControl>
                        <Textarea
                          aria-label="Evidence policy"
                          disabled={disabled}
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="forgeMetadata"
                    render={({ field }) => (
                      <FormItem className="rounded-md border border-border/70 bg-background p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <FormLabel>Forge metadata</FormLabel>
                            <FormDescription>
                              Emit template-safe inputs and evidence refs.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              aria-label="Forge metadata"
                              disabled={disabled}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agenticSearch"
                    render={({ field }) => (
                      <FormItem className="rounded-md border border-border/70 bg-background p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <FormLabel>Agentic Search</FormLabel>
                            <FormDescription>
                              Index discovery refs without becoming authority.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              aria-label="Agentic Search"
                              disabled={disabled}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </FormSection>

          <FormActions>
            {lastSavedWorkspace ? (
              <InputGroup className="max-w-xs">
                <InputGroupAddon>
                  <UiLabIcon name="check" />
                </InputGroupAddon>
                <InputGroupText>Saved {lastSavedWorkspace}</InputGroupText>
              </InputGroup>
            ) : null}
            <Button type="button" variant="outline" disabled={disabled}>
              <UiLabIcon name="shield" />
              Preview evidence
            </Button>
            <Button type="submit" disabled={disabled}>
              <UiLabIcon name={state === 'loading' ? 'loading' : 'check'} />
              Save settings
            </Button>
          </FormActions>
        </form>
      </Form>
    </FormShell>
  );
}
