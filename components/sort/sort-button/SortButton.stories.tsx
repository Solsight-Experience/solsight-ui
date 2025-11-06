import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SortButton } from './SortButton';
import { useState } from 'react';

const meta: Meta<typeof SortButton> = {
  title: 'Components/sort/SortButton',
  component: SortButton,
  tags: ['autodocs'],

  decorators: [
    (Story, context) => {
      const [type, setType] = useState<'none' | 'asc' | 'desc'>(context.args.type);
      const handleChangeType = () => {
        const types = ['none', 'asc', 'desc'];
        setType((prev) => {
          return types[(types.indexOf(prev) + 1) % types.length] as 'none' | 'asc' | 'desc';
        });
      };
      return (
        <div className="bg-black-dark p-10" onClick={handleChangeType}>
          <Story args={{ ...context.args, type: type }} />
        </div>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof SortButton>;

export const Default: Story = {
  args: {
    label: 'Money',
    type: 'none',
  },
};

export const Asc: Story = {
  args: {
    label: 'Money',
    type: 'asc',
  },
};

export const Desc: Story = {
  args: {
    label: 'Money',
    type: 'desc',
  },
};
