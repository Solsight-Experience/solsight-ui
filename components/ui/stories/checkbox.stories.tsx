import type { Meta, StoryObj, Args } from "@storybook/nextjs-vite";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Meta configuration
const meta: Meta<typeof Checkbox> = {
    title: "Components/Checkbox",
    component: Checkbox,
    parameters: {
        layout: "centered"
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="bg-black-dark p-10">
                <Story />
            </div>
        )
    ],
    argTypes: {
        disabled: {
            control: "boolean",
            description: "Disable the checkbox"
        },
        defaultChecked: {
            control: "boolean",
            description: "Initial checked state"
        },
        className: {
            control: "text",
            description: "Custom class names for styling"
        }
    }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic unchecked checkbox
export const Default: Story = {
    render: (args: Args) => (
        <div className="flex items-center gap-3">
            <Checkbox id="default" {...args} />
            <Label htmlFor="default">Accept terms and conditions</Label>
        </div>
    ),
    args: {
        id: "default"
    }
};

// Checked by default
export const Checked: Story = {
    ...Default,
    args: {
        id: "checked",
        defaultChecked: true
    }
};

// Disabled state
export const Disabled: Story = {
    ...Default,
    args: {
        id: "disabled",
        disabled: true
    }
};

// Disabled + checked
export const DisabledChecked: Story = {
    ...Default,
    args: {
        id: "disabled-checked",
        disabled: true,
        defaultChecked: true
    }
};

// With description text
export const WithDescription: Story = {
    render: () => (
        <div className="flex items-start gap-3">
            <Checkbox id="terms-desc" defaultChecked />
            <div className="grid gap-2">
                <Label htmlFor="terms-desc">Accept terms and conditions</Label>
                <p className="text-muted-foreground text-sm">By clicking this checkbox, you agree to the terms and conditions.</p>
            </div>
        </div>
    )
};

// Custom styled checkbox (blue theme)
export const CustomStyled: Story = {
    render: () => (
        <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
            <Checkbox
                id="custom"
                defaultChecked
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
            />
            <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">Enable notifications</p>
                <p className="text-muted-foreground text-sm">You can enable or disable notifications at any time.</p>
            </div>
        </Label>
    )
};

// Interactive demo (all states)
export const Playground: Story = {
    render: () => (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            <div className="flex items-start gap-3">
                <Checkbox id="terms-2" defaultChecked />
                <div className="grid gap-2">
                    <Label htmlFor="terms-2">Accept terms and conditions</Label>
                    <p className="text-muted-foreground text-sm">By clicking this checkbox, you agree to the terms and conditions.</p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Checkbox id="toggle" disabled />
                <Label htmlFor="toggle">Enable notifications</Label>
            </div>
            <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                <Checkbox
                    id="toggle-2"
                    defaultChecked
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                />
                <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">Enable notifications</p>
                    <p className="text-muted-foreground text-sm">You can enable or disable notifications at any time.</p>
                </div>
            </Label>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: "Interactive demo showcasing all common use cases of the Checkbox component."
            }
        }
    }
};
