'use client';

import { useQuery } from '@apollo/client/react';
import { GET_TALENT_PROFILES } from '../graphql/queries';
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, TALENT_PROFILE_ABI } from '../config/contracts';
import Link from 'next/link';

interface TalentProfile {
  id: string;
  name: string;
  bio: string;
  resumeHash: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

interface TalentProfilesData {
  talentProfiles: TalentProfile[];
}

export function TalentProfilesList() {
  const { loading, error, data } = useQuery<TalentProfilesData>(GET_TALENT_PROFILES, {
    fetchPolicy: 'cache-and-network'
  });

  // Create a function to get the most up-to-date profile data
  const getProfileData = (graphqlProfile: TalentProfile) => {
    // For now, we'll use GraphQL data but add a note about potential staleness
    // In a production app, you'd want to implement individual contract calls for each profile
    return {
      ...graphqlProfile,
      isStale: false, // We'll enhance this later
      dataSource: 'GraphQL'
    };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading && !data) return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading talent profiles...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching from blockchain and subgraph...</div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-lg text-red-600 mb-2">Error loading profiles</div>
          <div className="text-sm text-gray-600">{error.message}</div>
          <div className="mt-4 text-sm text-gray-500">
            This might be due to subgraph indexing delays. Try refreshing the page.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Talent Profiles</h2>

      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.talentProfiles?.map((profile: TalentProfile) => (
          <div key={profile.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {profile.name || 'Anonymous Profile'}
                </h3>
                <p className="text-sm text-gray-500 font-mono">
                  {formatAddress(profile.id)}
                </p>

              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Talent
              </span>
            </div>
            
            <div className="space-y-4 mb-4">
              {/* Bio Preview */}
              {profile.bio && (
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {profile.bio.length > 120 ? `${profile.bio.substring(0, 120)}...` : profile.bio}
                  </p>
                </div>
              )}
              
              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && profile.skills[0] !== '' && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        +{profile.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Profile Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Created: {formatTimestamp(profile.createdAt)}</span>
                {profile.resumeHash && (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Resume Available
                  </span>
                )}
              </div>
            </div>

            {/* View Details Button */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                href={`/talent/${profile.id}`}
                className="w-full btn-secondary text-sm text-center"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {(!data?.talentProfiles || data.talentProfiles.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <p className="text-gray-500 text-lg mb-2">No talent profiles found yet.</p>
          <p className="text-gray-400 text-sm mb-4">Be the first to create your profile!</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> If you've created a profile but don't see it here, 
              the subgraph might still be indexing. Check your individual profile page for real-time data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
