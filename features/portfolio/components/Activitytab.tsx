import React, { useState } from 'react';
import { ExternalLink, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useActivities } from '../hooks/portfolio.hooks';
import type { Activity } from '../types/portfolio.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  if (years === 1) return '1 year ago';
  return `${years} years ago`;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const groupActivitiesByDate = (activities: Activity[]) => {
  const grouped: { [key: string]: Activity[] } = {};

  activities.forEach((activity) => {
    const dateKey = formatDate(activity.timestamp);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(activity);
  });

  return grouped;
};

interface ActivityRowProps extends Activity {
  wallet_icon?: string;
}

const ActivityRow: React.FC<ActivityRowProps> = ({
  timestamp,
  app,
  token_in,
  token_out,
  token,
  wallet,
  wallet_icon,
  tags,
  tx_url,
}) => {
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <td className="py-4 px-2 text-base">{formatRelativeTime(timestamp)}</td>
      <td className="py-4 px-2">
        <div className="flex items-center gap-2">
          <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-lg" />
          <div className="flex flex-col">
            <span className="font-semibold text-base">{app.name}</span>
            <span className="text-sm text-gray-400">{app.type}</span>
          </div>
        </div>
      </td>
      <td className="py-4 px-2">
        {token_out && (
          <div className="flex items-center gap-1 text-green-500 text-base">
            <span>
              {token_out.amount > 0 ? '+' : ''}
              {token_out.amount.toFixed(token_out.amount < 0.001 ? 10 : 4)} {token_out.symbol}
            </span>
          </div>
        )}
        {token && token.amount > 0 && (
          <div className="flex items-center gap-1 text-green-500 text-base">
            <span>
              +{token.amount.toFixed(4)} {token.symbol}
            </span>
          </div>
        )}
      </td>
      <td className="py-4 px-2">
        {token_in && (
          <div className="flex items-center gap-1 text-red-500 text-base">
            <span>
              {token_in.amount.toFixed(4)} {token_in.symbol}
            </span>
          </div>
        )}
        {token && token.amount < 0 && (
          <div className="flex items-center gap-1 text-red-500 text-base">
            <span>
              {token.amount.toFixed(2)} {token.symbol}
            </span>
          </div>
        )}
      </td>
      <td className="py-4 px-2">
        <div className="flex items-center gap-2">
          {wallet_icon ? (
            <img src={wallet_icon} alt={wallet} className="w-8 h-8 rounded-full object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">{wallet[0].toUpperCase()}</span>
            </div>
          )}
          <span className="text-base">{wallet}</span>
        </div>
      </td>
      <td className="py-4 px-2">
        <div className="flex flex-wrap gap-1 max-w-full">
          {tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-full border border-blue-500 text-blue-500 text-xs whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="px-2 py-0.5 rounded-full border border-gray-500 text-gray-400 text-xs">
              +{tags.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-2">
        <a
          href={tx_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all"
        >
          <ExternalLink className="w-5 h-5 text-white" />
        </a>
      </td>
    </tr>
  );
};

export const ActivityTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: activitiesData, isLoading, error } = useActivities({
    limit: 50,
    type: 'all',
  });

  // Error state
  if (error) {
    return (
      <div className="border border-purple-600 bg-purple-950/20 p-8 rounded-lg">
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <AlertTriangle className="size-8 text-purple-500" />
          <div className="text-purple-500 text-lg font-medium">Error Loading Activities</div>
          <div className="text-gray-400 text-sm">
            {error instanceof Error ? error.message : 'Network error. Please try again.'}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-48"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!activitiesData?.activities) return null;

  // Empty state - no activities at all
  if (activitiesData.activities.length === 0) {
    return (
      <div className="border border-gray-600 p-12 rounded-lg">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-gray-400">
            <div className="text-xl mb-2">No activities yet</div>
            <div className="text-sm">Your transaction history will appear here</div>
          </div>
        </div>
      </div>
    );
  }

  // Filter activities by search query (address search)
  const filteredActivities = activitiesData.activities.filter((activity) => {
    if (!searchQuery) return true;
    return (
      activity.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.tx_hash.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const groupedActivities = groupActivitiesByDate(paginatedActivities);

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Page Size */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by wallet address or tx hash..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="pl-10 h-11 text-base border-gray-600"
          />
        </div>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1); // Reset to first page on size change
          }}
          className="h-11 px-4 rounded-md border border-gray-600 bg-transparent text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* Activities Table */}
      {Object.keys(groupedActivities).length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-base">
          No activities found
        </div>
      ) : (
        Object.entries(groupedActivities).map(([date, activities]) => (
          <div key={date} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-lg font-semibold">{date}</span>
              </div>
              <span className="text-base text-gray-400">{activities.length} activities</span>
            </div>

            <div className="border border-gray-600 rounded-lg overflow-hidden">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[15%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[20%]" />
                  <col className="w-[12%]" />
                  <col className="w-[5%]" />
                </colgroup>
                <thead className="bg-gray-900/50">
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-2 text-left text-base font-medium text-gray-400">Time</th>
                    <th className="py-3 px-2 text-left text-base font-medium text-gray-400">App</th>
                    <th className="py-3 px-2 text-left text-base font-medium text-gray-400">Receive</th>
                    <th className="py-3 px-2 text-left text-base font-medium text-gray-400">Sent</th>
                    <th className="py-3 px-2 text-left text-base font-medium text-gray-400">Wallet</th>
                    <th className="py-3 px-2 text-left text-base font-medium text-gray-400">Tags</th>
                    <th className="py-3 px-2 text-left text-base font-medium text-gray-400">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <ActivityRow key={activity.tx_hash} {...activity} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-base text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of{' '}
            {filteredActivities.length} activities
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="h-10 border-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-10 w-10 ${
                      page === pageNum
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'border-gray-600'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="h-10 border-gray-600"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
