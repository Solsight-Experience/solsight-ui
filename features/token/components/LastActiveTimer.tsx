import React, { useState, useEffect } from "react";
import { formatTimeAgo } from "../utils/token.utils";

interface LastActiveTimerProps {
    timestamp: number;
}

export const LastActiveTimer: React.FC<LastActiveTimerProps> = ({ timestamp }) => {
    const [display, setDisplay] = useState(() => formatTimeAgo(timestamp));

    useEffect(() => {
        const interval = setInterval(() => setDisplay(formatTimeAgo(timestamp)), 1000);
        return () => clearInterval(interval);
    }, [timestamp]);

    return <span>{display}</span>;
};
