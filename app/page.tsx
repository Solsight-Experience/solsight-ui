import TokenTable from "@/features/token-table/components/TokenTable";
import { ErrorBoundary } from "@/components/error-boundary";

export default function HomePage() {
    return (
        <div className="min-h-[calc(100vh-56px)] px-6 md:px-10 xl:px-16">
            {/* Page header */}
            <div className="flex items-end justify-between pt-7 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-[13px] w-[3px] rounded-full bg-violet-500" />
                        <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-violet-400">Solana Ecosystem</span>
                    </div>
                    <h1 className="text-[22px] font-bold tracking-tight text-white leading-tight">Discover</h1>
                    <p className="text-[12.5px] text-white/40 mt-0.5">Trending tokens, pools, and categories across Solana</p>
                </div>
            </div>

            {/* Token table */}
            <ErrorBoundary>
                <TokenTable />
            </ErrorBoundary>

            <div className="h-8" />
        </div>
    );
}
