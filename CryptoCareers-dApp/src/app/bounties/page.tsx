'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component with no SSR to prevent hydration issues
const BountyBoard = dynamic(
  () => import('../../components/BountyBoard').then(mod => ({ default: mod.BountyBoard })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading bounties...</p>
        </div>
      </div>
    )
  }
);

export default function BountiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <BountyBoard />
    </main>
  );
}
