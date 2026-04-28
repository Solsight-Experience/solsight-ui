type ReplyFn = (config: { url: string; data?: unknown; params?: URLSearchParams }) => [number, unknown] | Promise<[number, unknown]>;
type Reply = [number, unknown] | ReplyFn;

interface MockRoute {
    method: string;
    url: string | RegExp;
    reply: Reply;
}

export class FetchMockAdapter {
    private routes: MockRoute[] = [];
    private originalFetch: typeof fetch | null = null;
    private delayMs: number;
    private passthrough: boolean;

    constructor(options?: { delayResponse?: number; onNoMatch?: "passthrough" | "error" }) {
        this.delayMs = options?.delayResponse ?? 0;
        this.passthrough = options?.onNoMatch === "passthrough";
    }

    activate(): void {
        if (this.originalFetch) return;
        this.originalFetch = globalThis.fetch;
        globalThis.fetch = this.interceptedFetch.bind(this) as typeof fetch;
    }

    private matchRoute(method: string, url: string): MockRoute | undefined {
        return this.routes.find((route) => {
            if (route.method !== method.toUpperCase()) return false;
            if (route.url instanceof RegExp) return route.url.test(url);
            return url.includes(route.url);
        });
    }

    private async interceptedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const method = (init?.method || "GET").toUpperCase();

        const route = this.matchRoute(method, url);

        if (!route) {
            if (this.passthrough && this.originalFetch) {
                return this.originalFetch(input, init);
            }
            return new Response(JSON.stringify({ message: "No mock handler for request" }), { status: 404 });
        }

        if (this.delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.delayMs));
        }

        let status: number;
        let body: unknown;

        if (typeof route.reply === "function") {
            const parsedUrl = new URL(url, "http://localhost");
            const data = init?.body ? JSON.parse(init.body as string) : undefined;
            const result = await route.reply({ url, data, params: parsedUrl.searchParams });
            [status, body] = result;
        } else {
            [status, body] = route.reply;
        }

        return new Response(JSON.stringify(body), {
            status,
            headers: { "Content-Type": "application/json" }
        });
    }

    onGet(url: string | RegExp) {
        return this.on("GET", url);
    }

    onPost(url: string | RegExp) {
        return this.on("POST", url);
    }

    onPut(url: string | RegExp) {
        return this.on("PUT", url);
    }

    onDelete(url: string | RegExp) {
        return this.on("DELETE", url);
    }

    onPatch(url: string | RegExp) {
        return this.on("PATCH", url);
    }

    private on(method: string, url: string | RegExp) {
        return {
            reply: (statusOrFn: number | ReplyFn, data?: unknown) => {
                if (typeof statusOrFn === "function") {
                    this.routes.push({ method, url, reply: statusOrFn });
                } else {
                    this.routes.push({ method, url, reply: [statusOrFn, data] });
                }
            }
        };
    }

    reset(): void {
        this.routes = [];
    }

    restore(): void {
        if (this.originalFetch) {
            globalThis.fetch = this.originalFetch;
            this.originalFetch = null;
        }
        this.routes = [];
    }
}

let mockAdapter: FetchMockAdapter | null = null;

export function setupMockAdapter() {
    if (typeof window === "undefined") return;

    const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

    if (!isMockEnabled) {
        return;
    }

    mockAdapter = new FetchMockAdapter({
        delayResponse: 50,
        onNoMatch: "passthrough"
    });

    mockAdapter.activate();

    // Setup all mock handlers
    import("./handlers/portfolioHandlers").then(({ setupPortfolioMocks }) => {
        setupPortfolioMocks(mockAdapter!);
    });
    import("./handlers/tokenHandlers").then(({ setupTokenMockApi }) => {
        setupTokenMockApi(mockAdapter!);
    });

    return mockAdapter;
}

export function resetMockAdapter() {
    mockAdapter?.reset();
}

export function disableMockAdapter() {
    if (mockAdapter) {
        mockAdapter.restore();
        mockAdapter = null;
    }
}

export function getMockAdapter() {
    return mockAdapter;
}

if (typeof window !== "undefined") {
    setupMockAdapter();
}

export default mockAdapter;
