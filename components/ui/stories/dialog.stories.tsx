import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import * as React from 'react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../dialog';
import { Button } from '@/components/ui/button'; // assuming you have a Button component

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/*                               Basic Dialog                                 */
/* -------------------------------------------------------------------------- */
export const Basic: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                             Dialog Without Close Button                     */
/* -------------------------------------------------------------------------- */
export const WithoutCloseButton: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Custom Close</DialogTitle>
            <DialogDescription>
              Use your own close button anywhere inside the content.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                               Large Dialog                                 */
/* -------------------------------------------------------------------------- */
export const Large: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Large Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Large Modal</DialogTitle>
            <DialogDescription>
              This dialog uses a custom max-width via <code>className</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="h-32 rounded bg-muted/50 p-4">Content area (scrollable if needed)</div>
            <div className="h-32 rounded bg-muted/50 p-4">More content</div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                               Form Inside Dialog                            */
/* -------------------------------------------------------------------------- */
export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you`&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                defaultValue="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                className="mt-1 block w-full rounded border px-3 py-2 text-sm"
                defaultValue="john@example.com"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
};
