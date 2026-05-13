import type { Meta, StoryObj } from '@storybook/react-vite';

import { AgentCommandCenterTemplate } from '@/templates/agent-command-center';
import {
  CommandPaletteFlowTemplate,
  DashboardShellTemplate,
  DataTableWorkspaceTemplate,
  EnvironmentVariablesFormTemplate,
  ModalDrawerCrudTemplate,
  OnboardingEmptyStateTemplate,
  ProjectSettingsFormTemplate,
  SidebarAppShellTemplate,
  WorkflowBuilderShellTemplate,
  WorkflowExecutionReviewTemplate,
} from '@/templates/productization';
import { SettingsFormWorkspaceTemplate } from '@/templates/settings-form-workspace';
import { WorkflowReviewTemplate } from '@/templates/workflow-review';

const meta = {
  title: 'UI Lab/Templates',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AgentCommandCenter: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <AgentCommandCenterTemplate density="default" surface="elevated" />
    </main>
  ),
};

export const AgentCommandCenterCompact: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-4">
      <AgentCommandCenterTemplate density="compact" surface="outline" />
    </main>
  ),
};

export const WorkflowReview: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <WorkflowReviewTemplate density="default" state="focus" />
    </main>
  ),
};

export const WorkflowReviewInvalid: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <WorkflowReviewTemplate density="comfortable" state="invalid" />
    </main>
  ),
};

export const SettingsFormWorkspace: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <SettingsFormWorkspaceTemplate density="default" surface="elevated" state="focus" />
    </main>
  ),
};

export const SettingsFormWorkspaceCompact: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-4">
      <SettingsFormWorkspaceTemplate density="compact" surface="outline" />
    </main>
  ),
};

export const SettingsFormWorkspaceInvalid: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <SettingsFormWorkspaceTemplate density="comfortable" surface="flat" state="invalid" />
    </main>
  ),
};

export const DashboardShell: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <DashboardShellTemplate density="default" surface="elevated" state="focus" />
    </main>
  ),
};

export const ProjectSettingsForm: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <ProjectSettingsFormTemplate density="default" surface="outline" state="default" />
    </main>
  ),
};

export const EnvironmentVariablesForm: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <EnvironmentVariablesFormTemplate density="compact" surface="elevated" state="focus" />
    </main>
  ),
};

export const WorkflowBuilderShell: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <WorkflowBuilderShellTemplate density="default" surface="flat" state="default" />
    </main>
  ),
};

export const WorkflowExecutionReview: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <WorkflowExecutionReviewTemplate density="default" surface="elevated" state="loading" />
    </main>
  ),
};

export const CommandPaletteFlow: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <CommandPaletteFlowTemplate density="default" surface="outline" state="focus" />
    </main>
  ),
};

export const DataTableWorkspace: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <DataTableWorkspaceTemplate density="default" surface="elevated" state="default" />
    </main>
  ),
};

export const OnboardingEmptyState: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <OnboardingEmptyStateTemplate density="comfortable" surface="flat" state="empty" />
    </main>
  ),
};

export const ModalDrawerCrud: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <ModalDrawerCrudTemplate density="default" surface="outline" state="default" />
    </main>
  ),
};

export const SidebarAppShell: Story = {
  render: () => (
    <main className="min-h-screen bg-background p-6">
      <SidebarAppShellTemplate density="default" surface="elevated" state="default" />
    </main>
  ),
};
