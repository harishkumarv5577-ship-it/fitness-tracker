
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulse, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <HeartPulse className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-6xl font-bold font-headline text-destructive">404</h1>
      <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved. 
        Let's get you back on track.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
