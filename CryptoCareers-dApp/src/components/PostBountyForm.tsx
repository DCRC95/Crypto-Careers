'use client';

import { useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, BOUNTY_BOARD_ABI } from '../config/contracts';

interface BountyFormData {
  title: string;
  description: string;
  skills: string[];
  location: string;
  payment: string;
  company: string;
  deadline: string;
}

export function PostBountyForm() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState<BountyFormData>({
    title: '',
    description: '',
    skills: [''],
    location: '',
    payment: '',
    company: '',
    deadline: ''
  });
  const [skillInput, setSkillInput] = useState('');

  // Contract write for posting bounty
  const { data: postData, writeContract: postBounty, isPending: isPosting } = useContractWrite();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isPosted } = useWaitForTransactionReceipt({
    hash: postData,
  });

  const handleInputChange = (field: keyof BountyFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.title || !formData.description || !formData.payment || !formData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Convert ETH to wei
      const paymentInWei = (parseFloat(formData.payment) * Math.pow(10, 18)).toString();
      
      // Convert deadline to timestamp (assuming user enters future date)
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
      
      // Filter out empty skills
      const validSkills = formData.skills.filter(skill => skill.trim() !== '');
      
      postBounty({
        address: CONTRACT_ADDRESSES.BOUNTY_BOARD,
        abi: BOUNTY_BOARD_ABI,
        functionName: 'postBounty',
        args: [
          formData.title,
          formData.description,
          validSkills,
          paymentInWei,
          deadlineTimestamp
        ],
        value: paymentInWei // Send the bounty payment with the transaction
      });
    } catch (error) {
      console.error('Error posting bounty:', error);
      alert('Failed to post bounty. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      skills: [''],
      location: '',
      payment: '',
      company: '',
      deadline: ''
    });
    setSkillInput('');
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to post a bounty.</p>
        </div>
      </div>
    );
  }

  if (isPosted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-green-400 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bounty Posted Successfully!</h2>
          <p className="text-gray-600 mb-6">Your bounty has been posted to the blockchain.</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Transaction Hash: {postData?.slice(0, 10)}...{postData?.slice(-8)}</p>
            <p>View on Etherscan: 
              <a 
                href={`https://sepolia.etherscan.io/tx/${postData}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Open
              </a>
            </p>
          </div>
          <button
            onClick={resetForm}
            className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Post Another Bounty
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post a New Bounty</h1>
        <p className="text-lg text-gray-600">Create a new opportunity for talented developers</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Bounty Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Senior React Developer for DeFi App"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Remote, Dublin, London"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Payment */}
          <div>
            <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-2">
              Bounty Payment (ETH) *
            </label>
            <input
              type="number"
              id="payment"
              required
              min="0.001"
              step="0.001"
              value={formData.payment}
              onChange={(e) => handleInputChange('payment', e.target.value)}
              placeholder="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 0.001 ETH</p>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Deadline *
            </label>
            <input
              type="datetime-local"
              id="deadline"
              required
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Set a deadline for bounty completion</p>
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                id="skills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., React, Solidity"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center space-x-2"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description *
          </label>
          <textarea
            id="description"
            required
            rows={6}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the project, requirements, timeline, and any other important details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isPosting || isConfirming}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? 'Posting...' : isConfirming ? 'Confirming...' : 'Post Bounty'}
          </button>
        </div>

        {/* Transaction Status */}
        {(isPosting || isConfirming) && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-blue-800 font-medium">
                  {isPosting ? 'Posting bounty to blockchain...' : 'Confirming transaction...'}
                </p>
                <p className="text-blue-600 text-sm">
                  Please confirm the transaction in your wallet
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
