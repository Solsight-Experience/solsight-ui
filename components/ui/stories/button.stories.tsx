import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../button';
import { Plus, Trash2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    asChild: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Default Button',
    variant: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

// ======= SIZES =======

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Plus className="size-4" />,
  },
};

// ======= WITH ICONS =======

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="size-4" />
        Add Item
      </>
    ),
    variant: 'default',
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    children: (
      <>
        <Trash2 className="size-4" />
        Delete
      </>
    ),
    variant: 'destructive',
  },
};

// ======= DISABLED =======

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};
