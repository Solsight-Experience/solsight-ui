import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Label } from '../label';
import { Info } from 'lucide-react';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    className: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

/* -------------------------------------------------------------------------- */
/*                                 BASIC LABELS                               */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  args: {
    children: 'Default Label',
  },
};

export const WithIcon: Story = {
  render: () => (
    <Label className="inline-flex items-center gap-1.5">
      <Info className="size-3.5 text-muted-foreground" />
      Label with icon
    </Label>
  ),
};

export const Required: Story = {
  render: () => (
    <Label>
      Required field{' '}
      <span className="text-destructive" aria-label="required">
        *
      </span>
    </Label>
  ),
};

/* -------------------------------------------------------------------------- */
/*                                 DISABLED STATES                             */
/* -------------------------------------------------------------------------- */

export const DisabledViaPeer: Story = {
  render: () => (
    <>
      {/* peer element */}
      <input type="text" className="peer" disabled hidden />
      <Label htmlFor="">Label disabled via peer</Label>
    </>
  ),
};

export const DisabledViaGroup: Story = {
  render: () => (
    <div data-disabled>
      <Label>Label disabled via group data attribute</Label>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*                                 HELPER / DESCRIPTION                        */
/* -------------------------------------------------------------------------- */

export const WithHelper: Story = {
  render: () => (
    <div className="space-y-1">
      <Label>Username</Label>
      <p className="text-xs text-muted-foreground">Choose a unique username.</p>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/*                                 LAYOUT VARIANTS                             */
/* -------------------------------------------------------------------------- */

export const Inline: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Label className="w-32">First name</Label>
      <span className="h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
    </div>
  ),
};

export const Block: Story = {
  render: () => (
    <div className="space-y-2">
      <Label>Block label</Label>
      <div className="h-9 w-full rounded-md border border-input bg-transparent" />
    </div>
  ),
};
