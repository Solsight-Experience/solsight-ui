// src/stories/InputGroup.stories.tsx
import type { Args, Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import {
  Search,
  Mail,
  Send,
  DollarSign,
  Calendar,
  Clock,
  User,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import * as React from 'react';

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

// Reusable wrapper for consistent spacing
const GroupWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-8 w-full max-w-md">{children}</div>
);

// 1. Basic Input with Icon
export const BasicWithIcon: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup>
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search anything..." />
      </InputGroup>
    </GroupWrapper>
  ),
};

// 2. Input with Prefix & Suffix
export const WithPrefixSuffix: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup>
        <InputGroupAddon>
          <DollarSign className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </GroupWrapper>
  ),
};

// 3. Email Input with Button
export const WithButton: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup>
        <InputGroupAddon>
          <Mail className="size-4" />
        </InputGroupAddon>
        <InputGroupInput type="email" placeholder="Enter your email" />
        <InputGroupButton>
          <Send className="size-3.5" />
          Subscribe
        </InputGroupButton>
      </InputGroup>
    </GroupWrapper>
  ),
};

// 4. Password Input with Toggle
export const PasswordWithToggle: Story = {
  render: () => {
    const [show, setShow] = React.useState(false);
    return (
      <GroupWrapper>
        <InputGroup>
          <InputGroupAddon>
            <Lock className="size-4" />
          </InputGroupAddon>
          <InputGroupInput type={show ? 'text' : 'password'} placeholder="Enter password" />
          <InputGroupButton size="icon-xs" onClick={() => setShow(!show)}>
            {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </InputGroupButton>
        </InputGroup>
      </GroupWrapper>
    );
  },
};

// 5. Block Layout (Label on Top)
export const BlockLayout: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Delivery Address</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Enter full address..." rows={3} />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-xs">We`&apos;ll deliver to this address</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </GroupWrapper>
  ),
};

// 6. Date Range Input
export const DateRange: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup>
        <InputGroupAddon>
          <Calendar className="size-4" />
          <InputGroupText>From</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput type="date" />
        <InputGroupAddon align="inline-end">
          <Clock className="size-4" />
          <InputGroupText>To</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput type="date" />
      </InputGroup>
    </GroupWrapper>
  ),
};

// 7. Inline Start/End Addons
export const InlineAddons: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup>
        <InputGroupAddon>
          <User className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Username" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@company.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </GroupWrapper>
  ),
};

// 8. Error State
export const ErrorState: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup>
        <InputGroupAddon>
          <Mail className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Invalid email"
          aria-invalid="true"
          defaultValue="not-an-email"
        />
      </InputGroup>
    </GroupWrapper>
  ),
};

// 9. Disabled State
export const Disabled: Story = {
  render: () => (
    <GroupWrapper>
      <InputGroup data-disabled="true">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search is disabled" disabled />
        <InputGroupButton disabled>
          <Search className="size-3.5" />
        </InputGroupButton>
      </InputGroup>
    </GroupWrapper>
  ),
};

// 10. Interactive Playground
export const Playground: Story = {
  args: {
    className: '',
  },
  render: (args: Args) => (
    <GroupWrapper>
      <InputGroup {...args}>
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Type to search..." />
        <InputGroupButton>
          <Send className="size-3.5" />
          Go
        </InputGroupButton>
      </InputGroup>
    </GroupWrapper>
  ),
};
