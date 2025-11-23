import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useActivities } from '../hooks/portfolio.hooks';
import type { Activity } from '../types/portfolio.types';

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
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

interface ActivityRowProps extends Activity {}

const ActivityRow: React.FC<ActivityRowProps> = ({
  timestamp,
  app,
  token_in,
  token_out,
  token,
  wallet,
  tags,
  tx_url,
}) => {
  return (
    <tr className="border-b border-gray-700">
      <td className="py-4 px-2 text-sm">{formatTime(timestamp)}</td>
      <td className="py-4 px-2">
        <div className="flex items-center gap-2">
          <img src={app.icon} alt={app.name} className="w-8 h-8 rounded-lg" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{app.name}</span>
            <span className="text-xs text-gray-400">{app.type}</span>
          </div>
        </div>
      </td>
      <td className="py-4 px-2">
        {token_out && (
          <div className="flex items-center gap-1 text-green-500 text-sm">
            <span>
              {token_out.amount > 0 ? '+' : ''}
              {token_out.amount.toFixed(token_out.amount < 0.001 ? 10 : 4)} {token_out.symbol}
            </span>
          </div>
        )}
        {token && token.amount > 0 && (
          <div className="flex items-center gap-1 text-green-500 text-sm">
            <span>
              +{token.amount.toFixed(4)} {token.symbol}
            </span>
          </div>
        )}
      </td>
      <td className="py-4 px-2">
        {token_in && (
          <div className="flex items-center gap-1 text-red-500 text-sm">
            <span>
              {token_in.amount.toFixed(4)} {token_in.symbol}
            </span>
          </div>
        )}
        {token && token.amount < 0 && (
          <div className="flex items-center gap-1 text-red-500 text-sm">
            <span>
              {token.amount.toFixed(2)} {token.symbol}
            </span>
          </div>
        )}
      </td>
      <td className="py-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-xs">{wallet[0].toUpperCase()}</span>
          </div>
          <span className="text-sm">{wallet}</span>
        </div>
      </td>
      <td className="py-4 px-2">
        <div className="flex gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full border border-blue-500 text-blue-500 text-xs"
            >
              {tag}
            </span>
          ))}
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
  const { data: activitiesData, isLoading } = useActivities({
    limit: 50,
    type: 'all',
  });

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

  const groupedActivities = groupActivitiesByDate(activitiesData.activities);

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedActivities).map(([date, activities]) => (
        <div key={date} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-lg font-semibold">{date}</span>
            </div>
            <span className="text-sm text-gray-400">{activities.length} activities</span>
          </div>

          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">Time</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">App</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">Receive</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">Sent</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">Wallet</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">Tags</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-400">Link</th>
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
      ))}
    </div>
  );
};
