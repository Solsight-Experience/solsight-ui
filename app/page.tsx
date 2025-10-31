import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import TokenTable from '@/features/token-table/components/TokenTable';

export default function HomePage() {
  return (
    <div className="container mx-auto py-16">
      <TokenTable />
    </div>
  );
}
