"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that updates only after `delay` ms
 * have elapsed since the last change. Default 300ms.
 *
 * The returned value is stable across renders unless `value` changes.
 * If the component unmounts mid-debounce, the pending update is cancelled.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}
