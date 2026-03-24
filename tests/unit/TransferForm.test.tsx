import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TransferForm from "@/features/transfers/components/TransferForm";
import { describe, expect, it } from "vitest";

// Create a test wrapper with QueryClient
const createTestWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });

    const TestWrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    TestWrapper.displayName = "TestWrapper";
    return TestWrapper;
};

describe("TransferForm", () => {
    it("renders wallet connection button when not connected", () => {
        const Wrapper = createTestWrapper();

        render(
            <Wrapper>
                <TransferForm />
            </Wrapper>
        );

        expect(screen.getByText("Connect Phantom Wallet")).toBeInTheDocument();
        expect(screen.getByText("Connect your Phantom wallet to start transferring tokens")).toBeInTheDocument();
    });

    it("shows loading state when connecting wallet", async () => {
        const Wrapper = createTestWrapper();

        render(
            <Wrapper>
                <TransferForm />
            </Wrapper>
        );

        const connectButton = screen.getByText("Connect Phantom Wallet");
        fireEvent.click(connectButton);

        await waitFor(() => {
            expect(screen.getByText("Connecting...")).toBeInTheDocument();
        });
    });
});
