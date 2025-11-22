import { Button } from '@/components/ui/button';
import { Calendar, Copy, DollarSign, Star, TrendingUp, X } from 'lucide-react';

export default function ProfilePage() {
  const defaultWallet = MockWallet.wallets.find((w) => w.is_default);

  return (
    <div>
      <div className="flex items-center gap-10 border-b pl-60  border-gray-600 py-4">
        <div className="flex flex-col w-fit gap-2">
          <img src={MockUser.avatar_url} alt="" className="h-20 w-20 rounded-full" />
          {MockUser.is_verified ? (
            <div className="text-green-500 border text-center border-green-500  p-1 rounded-full">
              Verified
            </div>
          ) : (
            <div className="text-red-500 border text-center border-red-500  p-1 rounded-full">
              Not verified
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-gray-300 text-lg">{MockUser.username}</div>
          <div className="flex items-center gap-2">
            <div className="border border-gray-600 px-2 py-1 rounded-full">
              {defaultWallet?.address}
            </div>
            <Copy className="size-6 text-gray-400" />
          </div>
          <div className="flex gap-3">
            <Button>
              <img src="/x_icon.png" alt="" className="h-6 w-6" />
              X.com
            </Button>
            <Button>
              <img src="/github_icon.png" alt="" className="h-6 w-6" />
              Github
            </Button>
            <Button>
              <img src="/internet_icon.png" alt="" className="h-6 w-6" />
              Website
            </Button>
          </div>
        </div>
      </div>
      <div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-6">
            {/* Total Transactions */}
            <div className="border border-gray-600 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-2">Total transactions</div>
              <div className="text-3xl font-bold mb-3">
                {MockStats.total_transactions.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+{MockStats.transactions.change_vs_last_week}% This week</span>
              </div>
            </div>

            {/* Fees Saved */}
            <div className="border border-gray-600 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-2">Fees saved</div>
              <div className="text-3xl font-bold mb-3">{MockStats.fees_saved_percent}%</div>
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Relate to the market</span>
              </div>
            </div>

            {/* Days Active */}
            <div className="border border-gray-600 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-2">Days active</div>
              <div className="text-3xl font-bold mb-3">{MockStats.days_active}</div>
              <div className="flex items-center gap-2 text-purple-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Keep it up!</span>
              </div>
            </div>

            {/* Total Volume */}
            <div className="border border-gray-600 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-2">Total Volumes</div>
              <div className="text-3xl font-bold mb-3">
                {(MockStats.total_volume_usd / 1000).toFixed(1)}K$
              </div>
              <div className="flex items-center gap-2 text-purple-500 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center flex-col items-center w-full">
        {/* Connected Wallets Section */}
        <div className="mt-8 border border-gray-600 rounded-xl p-6 w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Connected Wallets</h2>
            <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add Wallet
            </Button>
          </div>

          <div className="space-y-4">
            {MockWallet.wallets.slice(0, 3).map((wallet, index) => (
              <div
                key={wallet.address}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Wallet Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-purple-600' : index === 1 ? 'bg-purple-700' : 'bg-blue-600'
                    }`}
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  </div>

                  {/* Wallet Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {index === 0
                          ? 'Main Wallet'
                          : index === 1
                            ? 'Second Wallet'
                            : 'Third Wallet'}
                      </span>
                      {wallet.is_default && (
                        <span className="flex items-center gap-1 text-purple-400 text-sm">
                          <Star className="w-4 h-4 fill-purple-400" />
                          Default Wallet
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded border border-gray-700">
                        {wallet.address}
                      </code>
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* More Options */}
                <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account Information Section */}
        <div className="mt-8 border border-gray-600 rounded-xl w-7xl p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Account Information</h2>
            <p className="text-gray-400 text-sm">Personal Details and Verification</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 text-sm mb-2">Fullname</div>
                <div className="text-lg">{MockUser.full_name}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-2">Phone</div>
                <div className="text-lg">{MockUser.phone}</div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 text-sm mb-2">Email</div>
                <div className="text-lg">{MockUser.email}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-2">Joined Date</div>
                <div className="text-lg">
                  {new Date(MockUser.joined_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Verify Account Button */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <Button
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Verify account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: API integration with real BACKEND ENDPOINT
const MockUser = {
  id: 'usr_92abf23e',
  username: 'devlansight',
  full_name: 'Lân Nguyễn',
  email: 'lan.nguyen@example.com',
  phone: '+84901234567',
  avatar_url: 'https://i.pravatar.cc/150?img=12',
  joined_at: '2024-07-18T10:32:45Z',
  is_verified: false,
  subscription_tier: 'pro',
  social_links: {
    twitter: 'https://twitter.com/devlansight',
    github: 'https://github.com/devlansight',
    website: 'https://lannguyen.dev',
  },
};

const MockWallet = {
  wallets: [
    {
      address: '5FkT1mX2gqVq9T4Lx7qHcNqzX2Qy8mJzZbBqT5j8t3oN',
      name: 'Phantom Wallet',
      icon: 'https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/688cfdedc848baa5dcb46202_685aaee76364cd101625876d_Phantom-logo.png',
      is_default: true,
      is_connected: true,
      added_at: '2024-08-22T14:05:13Z',
      balance_sol: 12.547,
      balance_usd: 2335.94,
    },
    {
      address: '7YtQ3mA9wDzT5xF3kLpVqM9yHbWjS8NnXsUqP9aH2bRt',
      name: 'Backpack Wallet',
      icon: 'backpack',
      is_default: false,
      is_connected: true,
      added_at: '2024-09-01T09:27:41Z',
      balance_sol: 4.218,
      balance_usd: 785.21,
    },
    {
      address: '3LpX5qU8nGkE6rF7bPwS9dL2xQjK8cNfMhRzY4vT1pZa',
      name: 'Coinbase Wallet',
      icon: 'https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/6839e3bc01620952b0aff662_Backpack-logo.png',
      is_default: false,
      is_connected: false,
      added_at: '2024-06-15T11:10:02Z',
      balance_sol: 1.004,
      balance_usd: 187.36,
    },
    {
      address: '9NsP4rB1wHxE7tL5vRmD8cT3pQjF9yUoZsQxE2nV6aKb',
      name: 'SolSight Wallet',
      icon: '/app_icon.png',
      is_default: false,
      is_connected: false,
      added_at: '2024-03-29T20:48:56Z',
      balance_sol: 25.673,
      balance_usd: 4789.22,
    },
  ],
  total_wallets: 4,
  total_balance_sol: 43.442,
  total_balance_usd: 8097.73,
};

const MockStats = {
  total_transactions: 482,
  transactions: {
    this_week: 37,
    this_month: 142,
    change_vs_last_week: 12.5,
  },
  total_volume_usd: 183240.75,
  volume: {
    this_week: 15840.2,
    this_month: 68210.5,
  },
  fees_paid_total: 213.47,
  fees_saved_percent: 28.4,
  days_active: 126,
  favorite_tokens_count: 9,
  wallets_connected: 3,
};
