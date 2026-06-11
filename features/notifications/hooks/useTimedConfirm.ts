import { useState, useRef, useEffect } from "react";

export function useTimedConfirm(onConfirm: () => void, timeoutMs = 3000) {
    const [confirming, setConfirming] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function request() {
        setConfirming(true);
        timerRef.current = setTimeout(() => setConfirming(false), timeoutMs);
    }

    function confirm() {
        if (timerRef.current) clearTimeout(timerRef.current);
        onConfirm();
        setConfirming(false);
    }

    function cancel() {
        if (timerRef.current) clearTimeout(timerRef.current);
        setConfirming(false);
    }

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        []
    );

    return { confirming, request, confirm, cancel };
}
