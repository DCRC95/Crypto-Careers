'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component with no SSR to prevent hydration issues
const TalentProfilePage = dynamic(
  () => import('../../components/TalentProfilePage').then(mod => ({ default: mod.TalentProfilePage })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function ProfilePage() {
  return <TalentProfilePage />;
}
