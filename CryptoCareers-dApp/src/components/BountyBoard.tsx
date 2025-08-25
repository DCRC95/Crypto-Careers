'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_BOUNTY_EVENTS } from '../graphql/queries';
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

export function BountyBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { loading, error, data, fetchMore } = useQuery<BountyEventsData>(GET_BOUNTY_EVENTS, {
    variables: {
      first: itemsPerPage,
      skip: currentPage * itemsPerPage
    },
    fetchPolicy: 'cache-and-network'
  });

  // Filter bounties based on search and filters
  const filteredBounties = data?.bountyPosteds?.filter((bounty: BountyEvent) => {
    const matchesSearch = bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bounty.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Add more sophisticated filtering here as needed
    return matchesSearch;
  }) || [];

  const handleLoadMore = () => {
    fetchMore({
      variables: {
        first: itemsPerPage,
        skip: (currentPage + 1) * itemsPerPage
      }
    });
    setCurrentPage(prev => prev + 1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPayment = (payment: string) => {
    // Convert from wei to ETH
    const ethValue = Number(payment) / Math.pow(10, 18);
    return `${ethValue.toFixed(4)} ETH`;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Bounty Board</h1>
              <p className="mt-2 text-lg text-muted-foreground">Discover opportunities and post your own bounties</p>
            </div>
            <Link
              href="/post-bounty"
              className="btn-primary inline-flex items-center"
            >
              <span className="mr-2">🚀</span>
              Post a Bounty
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search bounties by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input min-w-[120px]"
              >
                <option value="">All Roles</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filterTech}
                onChange={(e) => setFilterTech(e.target.value)}
                className="input min-w-[120px]"
              >
                <option value="">All Tech</option>
                <option value="react">React</option>
                <option value="solidity">Solidity</option>
                <option value="python">Python</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bounties Grid */}
        {loading && !data ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading bounties...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-lg text-red-600">Error loading bounties: {error.message}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBounties.map((bounty: BountyEvent) => (
                <div key={bounty.id} className="card p-6 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {bounty.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {bounty.company.slice(0, 6)}...{bounty.company.slice(-4)}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatPayment(bounty.payment)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Posted {formatTimestamp(bounty.blockTimestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Block #{bounty.blockNumber}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <Link
                        href={`/bounties/${bounty.id}`}
                        className="btn-secondary text-sm"
                      >
                        View Details
                      </Link>
                      <button className="btn-primary text-sm">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {filteredBounties.length > 0 && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="btn-secondary"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Bounties'}
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredBounties.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No bounties found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
