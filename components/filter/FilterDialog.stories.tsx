import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilterDialog } from "./FilterDialog";
import React, { useState } from "react";

const meta: Meta<typeof FilterDialog> = {
    title: "Components/filter/FilterDialog",
    component: FilterDialog,
    tags: ["autodocs"],
    decorators: [
        (Story, context) => {
            const [open, setOpen] = useState(false);

            return (
                <div style={{ padding: "2rem", background: "#f5f5f5" }}>
                    <button
                        onClick={() => setOpen(true)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            cursor: "pointer",
                            marginBottom: "1rem"
                        }}
                    >
                        Open Filter Dialog
                    </button>
                    <Story args={{ ...context.args, isOpen: open, onClose: setOpen }} />
                </div>
            );
        }
    ]
};

export default meta;

type Story = StoryObj<typeof FilterDialog>;

export const Default: Story = {
    args: {}
};
