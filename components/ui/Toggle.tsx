"use client";

import React, { useState } from "react";

interface ToggleProps {
    enabled?: boolean;
    onChange?: (enabled: boolean) => void;
    size?: "sm" | "md" | "lg";
}

const Toggle: React.FC<ToggleProps> = ({ enabled: controlledEnabled, onChange, size = "md" }) => {
    const [internalEnabled, setInternalEnabled] = useState(false);

    const enabled = controlledEnabled !== undefined ? controlledEnabled : internalEnabled;

    const handleToggle = () => {
        const newValue = !enabled;
        if (onChange) {
            onChange(newValue);
        }
        if (controlledEnabled === undefined) {
            setInternalEnabled(newValue);
        }
    };

    const sizes = {
        sm: {
            container: "w-10 h-6",
            circle: "w-5 h-5",
            translate: "translate-x-4"
        },
        md: {
            container: "w-14 h-8",
            circle: "w-7 h-7",
            translate: "translate-x-6"
        },
        lg: {
            container: "w-20 h-11",
            circle: "w-10 h-10",
            translate: "translate-x-9"
        }
    };

    const currentSize = sizes[size];

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`
        ${currentSize.container}
        relative inline-flex items-center rounded-full
        transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black
        ${enabled ? "bg-purple-500" : "bg-zinc-700"}
      `}
            role="switch"
            aria-checked={enabled}
        >
            <span
                className={`
          ${currentSize.circle}
          inline-block rounded-full bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${enabled ? currentSize.translate : "translate-x-0.5"}
        `}
            />
        </button>
    );
};

export default Toggle;
