import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from '../input';
import { SearchIcon, Mail, Lock } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'number', 'tel', 'url'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// ======= BASIC INPUTS =======

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'name@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '••••••••',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

// ======= STATES =======

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: 'Invalid input',
    'aria-invalid': true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="username" className="text-sm font-medium">
        Username
      </label>
      <Input id="username" placeholder="johndoe" />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <Input id="email" type="email" placeholder="you@example.com" />
      <p className="text-xs text-muted-foreground">We'll never share your email.</p>
    </div>
  ),
};

export const WithErrorMessage: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="password" className="text-sm font-medium">
        Password
      </label>
      <Input id="password" type="password" placeholder="Enter password" aria-invalid />
      <p className="text-xs text-destructive">Password is too weak.</p>
    </div>
  ),
};

// ======= FORM EXAMPLES =======

export const LoginForm: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input id="login-email" type="email" placeholder="you@example.com" className="pl-10" />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" />
        </div>
      </div>
    </div>
  ),
};

export const ProfileForm: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="first-name" className="text-sm font-medium">
          First Name
        </label>
        <Input id="first-name" placeholder="John" />
      </div>
      <div className="space-y-2">
        <label htmlFor="last-name" className="text-sm font-medium">
          Last Name
        </label>
        <Input id="last-name" placeholder="Doe" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <Input id="bio" placeholder="Tell us about yourself..." />
      </div>
    </div>
  ),
};

// ======= FILE INPUT (Custom) =======

export const FileInput: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="file-upload" className="text-sm font-medium">
        Upload Avatar
      </label>
      <Input id="file-upload" type="file" />
    </div>
  ),
};
