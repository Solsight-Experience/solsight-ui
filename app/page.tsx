import TokenTable from "@/features/token-table/components/TokenTable";
import { ErrorBoundary } from "@/components/error-boundary";

export default function HomePage() {
    return (
        <div className="px-16 mx-auto py-5">
            <ErrorBoundary>
                <TokenTable />
            </ErrorBoundary>
        </div>
    );
}
