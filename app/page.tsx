import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          FlaxH Trade
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The fastest and most secure way to transfer SOL tokens on the Solana blockchain. 
          Connect your wallet and start transferring in seconds.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard/transfer">
            <Button variant="outline" size="lg" className="text-lg px-8">
              Start Transfer
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="text-center">
          <CardHeader>
            <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>Secure & Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your private keys never leave your device. All transactions are processed securely through our audited backend.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
            <CardTitle>Lightning Fast</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Built on Solana&apos;s high-performance blockchain. Transfers complete in seconds with minimal fees.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Globe className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <CardTitle>Decentralized</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              No intermediaries, no custody. Direct peer-to-peer transfers on the Solana network.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-muted rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to start transferring?</h2>
        <p className="text-muted-foreground mb-6">
          Connect your Phantom wallet and send your first SOL transfer in under a minute.
        </p>
        <Link href="/dashboard/transfer">
          <Button size="lg">
            Transfer SOL Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
