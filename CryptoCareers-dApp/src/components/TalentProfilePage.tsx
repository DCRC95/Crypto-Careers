'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { useQuery } from '@apollo/client/react';
import { CONTRACT_ADDRESSES, TALENT_PROFILE_ABI } from '../config/contracts';
import { GET_TALENT_PROFILE_BY_ID } from '../graphql/queries';
import dynamic from 'next/dynamic';

interface ProfileData {
  name: string;
  email: string;
  telegram: string;
  bio: string;
  resumeHash: string;
  skills: string[];
  createdAt: number;
  updatedAt: number;
}

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

export function TalentProfilePage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    telegram: '',
    bio: '',
    resumeHash: '',
    skills: [''],
    createdAt: 0,
    updatedAt: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // GraphQL query to fetch full talent profile entity from subgraph
  // Try both original and lowercase addresses due to subgraph case sensitivity bug
  const { data: profileEntity, loading: loadingProfile, error: profileError, refetch } = useQuery<TalentProfileData>(
    GET_TALENT_PROFILE_BY_ID,
    {
      variables: { id: address ? address.toLowerCase() : '' }, // Use lowercase to work around subgraph bug
      fetchPolicy: 'network-only', // Always fetch from network, ignore cache
      skip: !address || !mounted || isEditing // Skip query while editing to prevent data override
    }
  );

  // Check if profile exists
  const { data: profileExists, isLoading: checkingProfile } = useContractRead({
    address: CONTRACT_ADDRESSES.TALENT_PROFILE,
    abi: TALENT_PROFILE_ABI,
    functionName: 'profileExists',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mounted,
    },
  });

  // Fetch existing profile data from contract (for editing)
  const { data: existingProfile, isLoading: loadingProfileFromContract, refetch: refetchContract } = useContractRead({
    address: CONTRACT_ADDRESSES.TALENT_PROFILE,
    abi: TALENT_PROFILE_ABI,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!profileExists && mounted,
    },
  });

  // Create profile transaction
  const { data: createData, writeContract: createProfile, isPending: isCreating } = useContractWrite();

  // Update profile transaction
  const { data: updateData, writeContract: updateProfile, isPending: isUpdating } = useContractWrite();

  // Wait for create transaction
  const { isLoading: isCreatePending, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createData,
  });

  // Wait for update transaction
  const { isLoading: isUpdatePending, isSuccess: isUpdateSuccess } = useWaitForTransactionReceipt({
    hash: updateData,
  });

  // Ensure component is mounted on client before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart data prioritization: Contract data takes precedence when newer
  useEffect(() => {
    if (profileEntity?.talentProfile && address && mounted && !isEditing) {
      const profile = profileEntity.talentProfile;
      console.log('🎯 Profile data received from GraphQL:', profile);
      
      // Check if GraphQL data is stale compared to contract data
      const graphqlUpdatedAt = Number(profile.updatedAt);
      const contractUpdatedAt = existingProfile ? Number(existingProfile.updatedAt) : 0;
      
      console.log('📊 Data freshness comparison:');
      console.log('   GraphQL updated at:', new Date(graphqlUpdatedAt * 1000));
      console.log('   Contract updated at:', new Date(contractUpdatedAt * 1000));
      console.log('   Time difference:', (contractUpdatedAt - graphqlUpdatedAt) / 60, 'minutes');
      
      // Only use GraphQL data if it's significantly newer than contract data
      // (allowing for small timing differences)
      const timeThreshold = 300; // 5 minutes in seconds
      if (graphqlUpdatedAt >= (contractUpdatedAt - timeThreshold)) {
        console.log('✅ Using GraphQL data (up-to-date)');
        setProfileData({
          name: profile.name || '',
          email: profile.email || '',
          telegram: profile.telegram || '',
          bio: profile.bio || '',
          resumeHash: profile.resumeHash || '',
          skills: profile.skills && profile.skills.length > 0 ? [...profile.skills] : [''],
          createdAt: Number(profile.createdAt) || 0,
          updatedAt: graphqlUpdatedAt || 0
        });
      } else {
        console.log('⚠️ GraphQL data is stale, keeping contract data');
        console.log('   GraphQL data is', (contractUpdatedAt - graphqlUpdatedAt) / 60, 'minutes behind contract');
      }
    } else if (profileError) {
      console.error('❌ GraphQL Error:', profileError);
      // If query fails, try with original case as fallback
      if (address && !loadingProfile) {
        console.log('🔄 Trying fallback query with original address case...');
        refetch({ id: address });
      }
    } else if (!loadingProfile && !profileEntity?.talentProfile) {
      console.log('⚠️ No profile data found in GraphQL response');
    }
  }, [profileEntity, address, mounted, profileError, loadingProfile, refetch, isEditing, existingProfile]);

  // Primary: Use contract data when available and it's the most recent
  useEffect(() => {
    if (existingProfile && profileExists && mounted && !isEditing) {
      const profile = existingProfile;
      const contractUpdatedAt = Number(profile.updatedAt);
      const graphqlUpdatedAt = profileEntity?.talentProfile ? Number(profileEntity.talentProfile.updatedAt) : 0;
      
      // Use contract data if:
      // 1. No GraphQL data available, OR
      // 2. Contract data is newer than GraphQL data
      if (!profileEntity?.talentProfile || contractUpdatedAt > graphqlUpdatedAt) {
        console.log('🔗 Using contract data (most up-to-date):', profile);
        console.log('   Contract updated at:', new Date(contractUpdatedAt * 1000));
        if (profileEntity?.talentProfile) {
          console.log('   GraphQL updated at:', new Date(graphqlUpdatedAt * 1000));
          console.log('   Contract is', (contractUpdatedAt - graphqlUpdatedAt) / 60, 'minutes newer');
        }
        
        setProfileData({
          name: profile.name || '',
          email: profile.email || '',
          telegram: profile.telegram || '',
          bio: profile.bio || '',
          resumeHash: profile.resumeHash || '',
          skills: profile.skills && profile.skills.length > 0 ? [...profile.skills] : [''],
          createdAt: Number(profile.createdAt) || 0,
          updatedAt: contractUpdatedAt || 0
        });
      } else {
        console.log('📊 Contract data available but GraphQL is newer, keeping GraphQL data');
      }
    }
  }, [existingProfile, profileExists, mounted, isEditing, profileEntity]);

  // Reset form after successful transaction
  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      setIsEditing(false);
      // Refetch GraphQL data to show updated profile
      if (refetch) {
        refetch();
      }
    }
  }, [isCreateSuccess, isUpdateSuccess, refetch]);

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!address) return;

    try {
      if (profileExists) {
        // Update existing profile
        updateProfile({
          address: CONTRACT_ADDRESSES.TALENT_PROFILE,
          abi: TALENT_PROFILE_ABI,
          functionName: 'updateProfile',
          args: [
            profileData.name,
            profileData.email,
            profileData.telegram,
            profileData.bio,
            profileData.resumeHash,
            profileData.skills
          ],
        });
      } else {
        // Create new profile
        createProfile({
          address: CONTRACT_ADDRESSES.TALENT_PROFILE,
          abi: TALENT_PROFILE_ABI,
          functionName: 'createProfile',
          args: [
            profileData.name,
            profileData.email,
            profileData.telegram,
            profileData.bio,
            profileData.resumeHash,
            profileData.skills
          ],
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Wallet Not Connected</h2>
            <p className="text-muted-foreground">Please connect your wallet to view and manage your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Your Talent Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your professional profile on the blockchain</p>
        </div>



        {/* Profile Display */}
        {!isEditing && (profileData.bio || profileData.resumeHash || (profileData.skills && profileData.skills.length > 0 && profileData.skills[0] !== '')) && (
          <div className="card p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {profileData.name || `Profile ${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Wallet:</span>
                  <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded border">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                {!profileData.name && (
                  <p className="text-sm text-yellow-600 mt-1">
                    ⚠️ Name field not available in deployed contract
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Bio</h3>
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <p className="text-foreground">{profileData.bio || 'No bio provided'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {profileData.email && (
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <span className="font-medium text-foreground">Email:</span>
                        <span className="text-foreground ml-2">{profileData.email}</span>
                      </div>
                    )}
                    {profileData.telegram && (
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <span className="font-medium text-foreground">Telegram:</span>
                        <span className="text-foreground ml-2">{profileData.telegram}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Skills</h3>
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    {profileData.skills && profileData.skills.length > 0 && profileData.skills[0] !== '' ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="badge badge-primary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Resume Hash</h3>
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    {profileData.resumeHash ? (
                      <div className="space-y-2">
                        <p className="font-mono text-sm break-all text-foreground">
                          {profileData.resumeHash}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profileData.resumeHash.startsWith('Qm') && (
                            <a
                              href={`https://ipfs.io/ipfs/${profileData.resumeHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                              </svg>
                              View on IPFS
                            </a>
                          )}
                          {profileData.resumeHash.startsWith('ar://') && (
                            <a
                              href={`https://arweave.net/${profileData.resumeHash.replace('ar://', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                              </svg>
                              View on Arweave
                            </a>
                          )}
                          {profileData.resumeHash.startsWith('0x') && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${profileData.resumeHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                              </svg>
                              View on Etherscan
                            </a>
                          )}
                          <a
                            href={`https://google.com/search?q=${encodeURIComponent(profileData.resumeHash)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            Search Hash
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No resume hash provided</p>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <span className="font-medium text-foreground">Created:</span> 
                    <span className="text-muted-foreground ml-2">{formatDate(profileData.createdAt)}</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <span className="font-medium text-foreground">Last Updated:</span> 
                    <span className="text-muted-foreground ml-2">{formatDate(profileData.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show form if no profile data or if editing */}
        {(!profileData.bio && !profileData.resumeHash && (!profileData.skills || profileData.skills.length === 0 || profileData.skills[0] === '') || isEditing) && (
          <div className="card p-8 mt-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              {profileExists ? 'Edit Your Profile' : 'Create Your Profile'}
            </h3>
            
            {/* Explanation for empty profile data */}
            {profileExists && !profileData.name && (
              <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Profile Data Not Loading</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your profile exists on the blockchain, but the subgraph isn't returning the full data. This might be because:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>The subgraph needs to be updated to handle enhanced events</li>
                        <li>The profile was created before the enhanced events were added</li>
                        <li>There's a mismatch between the smart contract and subgraph</li>
                      </ul>
                      <p className="mt-2">You can still edit your profile below, and the changes will be saved to the blockchain.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="telegram" className="block text-sm font-medium text-foreground mb-2">
                  Telegram Username
                </label>
                <input
                  type="text"
                  id="telegram"
                  value={profileData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  className="input"
                  placeholder="Enter your Telegram username (e.g., @username)"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                />
              </div>

              <div>
                <label htmlFor="resumeHash" className="block text-sm font-medium text-foreground mb-2">
                  Resume Hash
                </label>
                <input
                  type="text"
                  id="resumeHash"
                  value={profileData.resumeHash}
                  onChange={(e) => handleInputChange('resumeHash', e.target.value)}
                  className="input"
                  placeholder="IPFS hash or blockchain reference to your resume"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  You can upload your resume to IPFS and provide the hash here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="input flex-1"
                    placeholder="Add a skill"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn-primary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills && profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="badge badge-primary flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-primary-foreground hover:text-primary-foreground/80"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills added yet</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating || isCreatePending || isUpdatePending}
                  className="btn-primary flex-1"
                >
                  {isCreating || isUpdating || isCreatePending || isUpdatePending ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                      {isCreatePending || isUpdatePending ? 'Transaction Pending...' : 'Processing...'}
                    </span>
                  ) : (
                    profileExists ? 'Update Profile' : 'Create Profile'
                  )}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Transaction Status */}
        {(isCreatePending || isUpdatePending) && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <p className="font-medium text-blue-900">Transaction Pending...</p>
                <p className="text-sm text-blue-700">
                  Please wait while your transaction is being processed on the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {(isCreateSuccess || isUpdateSuccess) && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-900">
                  {isCreateSuccess ? 'Profile Created!' : 'Profile Updated!'}
                </p>
                <p className="text-sm text-green-700">
                  Your profile has been successfully saved to the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
