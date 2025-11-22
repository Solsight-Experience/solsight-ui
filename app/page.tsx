import TokenTable from '@/features/token-table/components/TokenTable';
import { ErrorBoundary } from '@/components/error-boundary';

export default function HomePage() {
  return (
    <div className="container mx-auto py-16">
      <ErrorBoundary>
        <TokenTable />
      </ErrorBoundary>
    </div>
  );
}
