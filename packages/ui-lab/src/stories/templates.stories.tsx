import type { Meta, StoryObj } from '@storybook/react-vite';

import { AgentCommandCenterTemplate } from '@/templates/agent-command-center';
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
