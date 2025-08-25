'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_TALENT_PROFILE_BY_ID } from '../../../graphql/queries';
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, TALENT_PROFILE_ABI } from '../../../config/contracts';

interface TalentProfileEntity {
  id: string;
  name: string;
  email: string;
  telegram: string;
  bio: string;
  resumeHash: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

interface TalentProfileData {
  talentProfile: TalentProfileEntity;
}

export default function TalentProfileDetailPage() {
  const params = useParams();
  const profileId = params.id as string;

  // GraphQL query for profile data
  const { data: profileEntity, loading: loadingProfile, error: profileError } = useQuery<TalentProfileData>(
    GET_TALENT_PROFILE_BY_ID,
    {
      variables: { id: profileId.toLowerCase() },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Contract read as fallback
  const { data: existingProfile, isLoading: loadingProfileFromContract } = useContractRead({
    address: CONTRACT_ADDRESSES.TALENT_PROFILE,
    abi: TALENT_PROFILE_ABI,
    functionName: 'getProfile',
    args: [profileId],
    query: {
      enabled: !!profileId,
    },
  });

  const formatTimestamp = (timestamp: string | number) => {
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

  // Use contract data if GraphQL is not available or stale
  const profile = existingProfile || profileEntity?.talentProfile;
  const isLoading = loadingProfile && loadingProfileFromContract;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (profileError && !existingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg text-red-600">Error loading profile: {profileError.message}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {profile.name || `Profile ${formatAddress(profileId)}`}
              </h1>
              <p className="text-lg text-gray-600">Talent Profile</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
              <div className="font-mono text-lg bg-white px-3 py-2 rounded-lg border shadow-sm">
                {formatAddress(profileId)}
              </div>
            </div>
          </div>
          
          {/* Data source indicator */}
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500 mr-2">Data source:</span>
            {existingProfile && profileEntity?.talentProfile ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                GraphQL + Contract (Synced)
              </span>
            ) : existingProfile ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                Contract (Real-time)
              </span>
            ) : profileEntity?.talentProfile ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                GraphQL (May be stale)
              </span>
            ) : null}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || 'No bio provided'}
                </p>
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && profile.skills[0] !== '' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume */}
            {profile.resumeHash && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resume & Portfolio</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-mono text-sm break-all text-gray-700">
                      {profile.resumeHash}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.resumeHash.startsWith('Qm') && (
                      <a
                        href={`https://ipfs.io/ipfs/${profile.resumeHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                        </svg>
                        View on IPFS
                      </a>
                    )}
                    {profile.resumeHash.startsWith('ar://') && (
                      <a
                        href={`https://arweave.net/${profile.resumeHash.replace('ar://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                        </svg>
                        View on Arweave
                      </a>
                    )}
                    {profile.resumeHash.startsWith('0x') && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${profile.resumeHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                        </svg>
                        View on Etherscan
                      </a>
                    )}
                    <a
                      href={`https://google.com/search?q=${encodeURIComponent(profile.resumeHash)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      Search Hash
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {(profile.email || profile.telegram) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {profile.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>
                  )}
                  {profile.telegram && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Telegram</p>
                      <p className="text-gray-600">{profile.telegram}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Profile ID</p>
                  <div className="bg-gray-50 px-3 py-2 rounded border">
                    <p className="text-sm font-mono text-gray-600 break-all leading-relaxed">
                      {profileId}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Created</p>
                  <p className="text-gray-600">{formatTimestamp(profile.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                  <p className="text-gray-600">{formatTimestamp(profile.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Network</p>
                  <p className="text-gray-600">Sepolia Testnet</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Contract</p>
                  <a
                    href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESSES.TALENT_PROFILE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-mono break-all"
                  >
                    {formatAddress(CONTRACT_ADDRESSES.TALENT_PROFILE)}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
