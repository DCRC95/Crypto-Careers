'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_BOUNTY_EVENTS } from '../../../graphql/queries';
import Link from 'next/link';

interface BountyEvent {
  id: string;
  bountyId: string;
  company: string;
  title: string;
  payment: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface BountyEventsData {
  bountyPosteds: BountyEvent[];
}

export default function BountyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bountyId = params.id as string;
  
  const [bounty, setBounty] = useState<BountyEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const { data, error } = useQuery<BountyEventsData>(GET_BOUNTY_EVENTS, {
    variables: {
      first: 1000, // Get all bounties to find the specific one
      skip: 0
    },
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    if (data?.bountyPosteds) {
      const foundBounty = data.bountyPosteds.find(b => b.id === bountyId);
      if (foundBounty) {
        setBounty(foundBounty);
      }
      setLoading(false);
    }
  }, [data, bountyId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPayment = (payment: string) => {
    const ethValue = Number(payment) / Math.pow(10, 18);
    return `${ethValue.toFixed(6)} ETH`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading bounty details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg text-red-600">Error loading bounty: {error.message}</p>
          <Link href="/bounties" className="btn-primary mt-4 inline-block">
            Back to Bounties
          </Link>
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Bounty not found</h3>
          <p className="text-muted-foreground mb-4">The bounty you're looking for doesn't exist</p>
          <Link href="/bounties" className="btn-primary">
            Back to Bounties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/bounties"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bounties
          </Link>
        </div>

        {/* Bounty Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                {bounty.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Company: {formatAddress(bounty.company)}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Posted: {formatTimestamp(bounty.blockTimestamp)}</span>
                </div>
              </div>
            </div>
            
            <div className="lg:text-right">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatPayment(bounty.payment)}
              </div>
              <div className="text-sm text-muted-foreground">
                Bounty Reward
              </div>
            </div>
          </div>
        </div>

        {/* Bounty Details Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Section */}
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                This is a detailed description of the bounty. The actual description would come from the smart contract data.
                For now, this is placeholder content that demonstrates the layout.
              </p>
            </div>

            {/* Requirements Section */}
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Requirements</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Experience with blockchain development</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Proficiency in Solidity and smart contracts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Understanding of DeFi protocols</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Ability to work independently and meet deadlines</span>
                </div>
              </div>
            </div>

            {/* Application Section */}
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">How to Apply</h2>
              <p className="text-muted-foreground mb-4">
                To apply for this bounty, please submit your proposal including:
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Your approach to solving the problem</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Timeline for completion</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="text-muted-foreground">Previous relevant work examples</span>
                </div>
              </div>
              <button className="btn-primary w-full">
                Apply for this Bounty
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bounty Info Card */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Bounty Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Bounty ID</div>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {bounty.bountyId}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Block Number</div>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    #{bounty.blockNumber}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
                    {bounty.transactionHash}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Company Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Company Address</div>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
                    {bounty.company}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Network</div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Sepolia Testnet</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="btn-secondary w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save Bounty
                </button>
                <button className="btn-secondary w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Bounty
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
