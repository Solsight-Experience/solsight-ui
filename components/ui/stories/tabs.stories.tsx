// src/stories/Tabs.stories.tsx
import type { Args, Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Home,
  Lock,
  Settings,
  User,
  Bell,
  Mail,
  Calendar,
  BarChart,
  FileText,
  Zap,
} from 'lucide-react';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: { control: 'text' },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Reusable wrapper for consistent demo layout
const TabsWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-2xl">{children}</div>
);

// 1. Default Horizontal Tabs
export const Default: Story = {
  render: () => (
    <TabsWrapper>
      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">
            <Home className="size-4" />
            Home
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="size-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="mt-4">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-lg font-semibold">Welcome Home</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This is the home tab content. You can put anything here.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="profile" className="mt-4">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-lg font-semibold">Your Profile</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your personal information and preferences.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-lg font-semibold">Settings</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure application settings and behavior.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </TabsWrapper>
  ),
};

// 2. Icon-Only Tabs
export const IconOnly: Story = {
  render: () => (
    <TabsWrapper>
      <Tabs defaultValue="mail">
        <TabsList>
          <TabsTrigger value="mail">
            <Mail className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="size-4" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mail" className="mt-4 text-center">
          <Mail className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No new messages</p>
        </TabsContent>
        <TabsContent value="calendar" className="mt-4 text-center">
          <Calendar className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Today is a good day</p>
        </TabsContent>
      </Tabs>
    </TabsWrapper>
  ),
};

// 3. Vertical Tabs
export const Vertical: Story = {
  render: () => (
    <TabsWrapper>
      <Tabs defaultValue="overview" orientation="vertical">
        <div className="flex gap-4">
          <TabsList className="flex-col h-fit w-40 justify-start">
            <TabsTrigger value="overview" className="justify-start w-full">
              <Zap className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="justify-start w-full">
              <Bell className="size-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="reports" className="justify-start w-full">
              <BarChart className="size-4" />
              Reports
            </TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <TabsContent value="overview">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Dashboard Overview</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  High-level summary of your account and recent activity.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="activity">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  View all recent actions and notifications.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="reports">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Analytics & Reports</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detailed insights and downloadable reports.
                </p>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </TabsWrapper>
  ),
};

// 4. Disabled Tab
export const WithDisabled: Story = {
  render: () => (
    <TabsWrapper>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="disabled" disabled>
            Disabled
          </TabsTrigger>
          <TabsTrigger value="locked">
            <Lock className="size-4" />
            Locked
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <div className="rounded-lg border bg-card p-6">
            <p>This tab is active and fully functional.</p>
          </div>
        </TabsContent>
        <TabsContent value="locked" className="mt-4">
          <div className="rounded-lg border bg-card p-6">
            <p>This tab is locked until you upgrade your plan.</p>
          </div>
        </TabsContent>
      </Tabs>
    </TabsWrapper>
  ),
};

// 5. Many Tabs (Scrollable)
export const Scrollable: Story = {
  render: () => (
    <TabsWrapper>
      <Tabs defaultValue="tab1">
        <TabsList className="w-full justify-start overflow-x-auto">
          {Array.from({ length: 8 }, (_, i) => (
            <TabsTrigger key={i} value={`tab${i + 1}`}>
              Tab {i + 1}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="tab1" className="mt-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Tab 1 Content</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Use horizontal scroll when there are many tabs.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </TabsWrapper>
  ),
};

// 6. Custom Styled Tabs
export const CustomStyled: Story = {
  render: () => (
    <TabsWrapper>
      <Tabs defaultValue="premium">
        <TabsList className="bg-primary/10 p-1">
          <TabsTrigger
            value="free"
            className="data-[state=active]:bg-transparent data-[state=active]:text-muted-foreground"
          >
            Free
          </TabsTrigger>
          <TabsTrigger
            value="premium"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Premium
          </TabsTrigger>
          <TabsTrigger
            value="enterprise"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Enterprise
          </TabsTrigger>
        </TabsList>
        <TabsContent value="premium" className="mt-4">
          <div className="rounded-lg border-2 border-primary bg-card p-6">
            <h3 className="text-lg font-semibold text-primary">Premium Plan</h3>
            <p className="mt-2 text-sm">Unlock advanced features and priority support.</p>
          </div>
        </TabsContent>
      </Tabs>
    </TabsWrapper>
  ),
};

// 7. Interactive Playground
export const Playground: Story = {
  args: {
    defaultValue: 'tab1',
    orientation: 'horizontal',
    className: '',
  },
  render: (args: Args) => (
    <TabsWrapper>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="tab1">First</TabsTrigger>
          <TabsTrigger value="tab2">Second</TabsTrigger>
          <TabsTrigger value="tab3">Third</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="mt-4">
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-2xl font-bold text-primary">Customize in Controls</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Change orientation, default tab, or add custom classes.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="tab2" className="mt-4">
          <div className="rounded-lg border bg-card p-6">Second tab content</div>
        </TabsContent>
        <TabsContent value="tab3" className="mt-4">
          <div className="rounded-lg border bg-card p-6">Third tab content</div>
        </TabsContent>
      </Tabs>
    </TabsWrapper>
  ),
};
