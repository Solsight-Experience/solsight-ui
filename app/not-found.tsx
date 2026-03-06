import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <section className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-xl border-border/80 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-brand-200">ERROR 404</p>
          <CardTitle className="text-3xl font-bold">Page not found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or has been moved to a different address.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Go to Discover</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/portfolio">Open Portfolio</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
