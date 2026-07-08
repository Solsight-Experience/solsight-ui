import { useEffect, useState } from "react";

/** `navigator.userAgentData` isn't in the standard lib.dom types yet. */
type NavigatorWithUAData = Navigator & {
    userAgentData?: { platform?: string };
};

/**
 * Detects macOS on the client. Always returns `false` on the server and on
 * initial client render to keep SSR/CSR markup identical, then updates after
 * mount — callers that render OS-dependent text should pass
 * `suppressHydrationWarning` on that node.
 */
export function useIsMac(): boolean {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        const nav = navigator as NavigatorWithUAData;
        const platform = nav.userAgentData?.platform ?? nav.platform ?? nav.userAgent;

        setIsMac(/mac/i.test(platform));
    }, []);

    return isMac;
}
