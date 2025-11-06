import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../card';
import { Button } from '../button';
import { Plus, MoreVertical, Trash2, Edit } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// ======= BASIC CARD =======

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a description of the card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This is the main content of the card. You can put any content here.
        </p>
      </CardContent>
    </Card>
  ),
};

// ======= WITH ACTION =======

export const WithAction: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
        <CardDescription>Manage your project preferences.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Auto-save</span>
            <span className="text-sm text-muted-foreground">Enabled</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Notifications</span>
            <span className="text-sm text-muted-foreground">On</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

// ======= WITH FOOTER =======

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Plan</CardTitle>
        <CardDescription>Unlock premium features.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li>✓ Unlimited projects</li>
          <li>✓ Priority support</li>
          <li>✓ Advanced analytics</li>
        </ul>
      </CardContent>
      <CardFooter className="border-t">
        <Button className="w-full">Upgrade Now</Button>
      </CardFooter>
    </Card>
  ),
};

// ======= FULL CARD EXAMPLE =======

export const FullExample: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>Add a new task to your todo list.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            <Trash2 className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <p className="text-sm text-muted-foreground">Build landing page</p>
          </div>
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <p className="text-sm text-muted-foreground">Tomorrow, 3:00 PM</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t justify-between">
        <Button variant="outline" size="sm">
          <Edit className="size-3.5 mr-1.5" />
          Edit
        </Button>
        <Button size="sm">
          <Plus className="size-3.5 mr-1.5" />
          Save Task
        </Button>
      </CardFooter>
    </Card>
  ),
};

// ======= COMPACT CARD =======

export const Compact: Story = {
  render: () => (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-base">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold">42</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

// ======= HORIZONTAL CARD (Custom Layout) =======

export const Horizontal: Story = {
  render: () => (
    <Card className="flex flex-row items-center gap-6 p-4">
      <div className="bg-muted rounded-lg size-16 flex items-center justify-center">
        <span className="text-2xl font-bold text-muted-foreground">A</span>
      </div>
      <div className="flex-1">
        <CardTitle className="text-lg">Acme Inc.</CardTitle>
        <CardDescription>Software Development</CardDescription>
      </div>
      <CardAction>
        <Button variant="ghost" size="icon">
          <MoreVertical className="size-4" />
        </Button>
      </CardAction>
    </Card>
  ),
};
