import { parseAbi } from 'viem';

// Contract addresses - deployed on Sepolia testnet
export const CONTRACT_ADDRESSES = {
  TALENT_PROFILE: '0x6f1e23dcda6e8697A825CAF957bBaa273AE9fcbF',
  BOUNTY_BOARD: '0xBDb394D66FfAB12000336b4Bb174105C50Df702e',
} as const;

// ABI for the TalentProfile contract - extracted from deployed contract
export const TALENT_PROFILE_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_email", "type": "string"},
      {"internalType": "string", "name": "_telegram", "type": "string"},
      {"internalType": "string", "name": "_bio", "type": "string"},
      {"internalType": "string", "name": "_resumeHash", "type": "string"},
      {"internalType": "string[]", "name": "_skills", "type": "string[]"}
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_email", "type": "string"},
      {"internalType": "string", "name": "_telegram", "type": "string"},
      {"internalType": "string", "name": "_bio", "type": "string"},
      {"internalType": "string", "name": "_resumeHash", "type": "string"},
      {"internalType": "string[]", "name": "_skills", "type": "string[]"}
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getProfile",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "email", "type": "string"},
          {"internalType": "string", "name": "telegram", "type": "string"},
          {"internalType": "string", "name": "bio", "type": "string"},
          {"internalType": "string", "name": "resumeHash", "type": "string"},
          {"internalType": "string[]", "name": "skills", "type": "string[]"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "updatedAt", "type": "uint256"}
        ],
        "internalType": "struct TalentProfile.Profile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "profileExists",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "hasProfile",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "profiles",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "email", "type": "string"},
      {"internalType": "string", "name": "telegram", "type": "string"},
      {"internalType": "string", "name": "bio", "type": "string"},
      {"internalType": "string", "name": "resumeHash", "type": "string"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "updatedAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ABI for the BountyBoard contract
export const BOUNTY_BOARD_ABI = parseAbi([
  'function postBounty(string _title, string _description, string[] _requiredSkills, uint256 _payment, uint256 _deadline) external payable',
  'function applyForBounty(uint256 _bountyId, string _coverLetter) external',
  'function acceptApplication(uint256 _bountyId, uint256 _applicationIndex) external',
  'function completeBounty(uint256 _bountyId, uint256 _applicationIndex) external',
  'function getBounty(uint256 _bountyId) external view returns (uint256, address, string, string, string[], uint256, bool, uint256, uint256)',
  'function getBountyCount() external view returns (uint256)',
  'function getApplications(uint256 _bountyId) external view returns (address[], string[], uint256[], bool[], bool[])'
]);
