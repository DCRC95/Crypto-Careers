# Talent Profile Page - ChainTalent dApp

## Overview
The Talent Profile Page allows users to create and manage their professional profiles on the blockchain using the TalentProfile smart contract.

## Features

### For New Users
- Create a new professional profile
- Input fields for name, bio, skills, and resume hash
- Dynamic skills management (add/remove skills)
- Form validation and error handling

### For Existing Users
- View current profile information
- Edit existing profile details
- Update skills and personal information
- View creation and last update timestamps

### Web3 Integration
- **useAccount**: Detects wallet connection status
- **useContractRead**: Fetches profile data from smart contract
- **useContractWrite**: Handles profile creation and updates
- **useWaitForTransactionReceipt**: Monitors transaction status

## Smart Contract Integration

### Contract Functions Used
- `profileExists(address)`: Checks if a user has a profile
- `getProfile(address)`: Retrieves user profile data
- `createProfile(name, bio, resumeHash, skills)`: Creates new profile
- `updateProfile(name, bio, resumeHash, skills)`: Updates existing profile

### Data Structure
```solidity
struct Profile {
    string name;
    string bio;
    string resumeHash;
    string[] skills;
    uint256 createdAt;
    uint256 updatedAt;
}
```

## Setup Instructions

### 1. Smart Contracts (Already Deployed)
The smart contracts are already deployed on Sepolia testnet:
- **TalentProfile**: `0xcA1C210a57D92b4b5D11B5f8aE9A4D6310C51d0B`
- **BountyBoard**: `0xA5eEb85f4C4c07ADeE8A91E281Bafd0F41233a6e`

### 2. Contract Addresses (Already Configured)
The contract addresses are already configured in `src/config/contracts.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  TALENT_PROFILE: '0xcA1C210a57D92b4b5D11B5f8aE9A4D6310C51d0B', // Deployed on Sepolia
  BOUNTY_BOARD: '0xA5eEb85f4C4c07ADeE8A91E281Bafd0F41233a6e', // Deployed on Sepolia
};
```

### 3. Start Development Server
```bash
cd CryptoCareers-dApp
npm run dev
```

### 4. Access the Page
Navigate to `/profile` in your browser.

## User Experience Features

### Loading States
- Skeleton UI while fetching profile data
- Spinner during transaction processing
- Clear feedback for all user actions

### Transaction Feedback
- Real-time transaction status updates
- Success/error notifications
- Automatic page refresh after successful transactions

### Responsive Design
- Mobile-friendly interface
- Clean, modern UI using Tailwind CSS
- Consistent with the overall dApp design

## File Structure
```
src/
├── components/
│   └── TalentProfilePage.tsx    # Main profile component
├── config/
│   └── contracts.ts             # Contract configuration
└── app/
    └── profile/
        └── page.tsx             # Profile route
```

## Dependencies
- **wagmi**: Web3 hooks and wallet integration
- **viem**: Ethereum client and ABI parsing
- **@rainbow-me/rainbowkit**: Wallet connection UI
- **@tanstack/react-query**: Data fetching and caching

## Testing
1. Connect a wallet using RainbowKit
2. Navigate to `/profile`
3. Create a new profile or edit existing one
4. Verify transaction success on blockchain explorer

## Notes
- The page automatically detects whether a user has an existing profile
- All profile data is stored on-chain for transparency and immutability
- Skills are managed as an array with add/remove functionality
- Resume hash can be an IPFS hash or any blockchain reference
