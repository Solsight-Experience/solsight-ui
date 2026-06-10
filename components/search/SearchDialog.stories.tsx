import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchDialog } from "./SearchDialog";
import { useState } from "react";

const meta: Meta<typeof SearchDialog> = {
    title: "Components/search/SearchDialog",
    component: SearchDialog,
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
                        Open Search Dialog
                    </button>
                    <Story args={{ ...context.args, isOpen: open, onCloseAction: setOpen }} />
                </div>
            );
        }
    ]
};

export default meta;

type Story = StoryObj<typeof SearchDialog>;

export const Default: Story = {
    args: {}
};
