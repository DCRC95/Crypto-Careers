# ChainTalent - Decentralized Talent Hub

A decentralized talent platform for the Irish tech sector that empowers job seekers by giving them ownership of their career data and allows companies to post verifiable "bounties" for specific tasks.

## 🚀 Features

- **Wallet Connection**: Seamless Web3 wallet integration using RainbowKit
- **Talent Profiles**: On-chain professional profiles stored on the blockchain
- **Bounty Board**: Companies can post and manage job opportunities
- **Smart Contracts**: Transparent and trustless interactions
- **Modern UI**: Beautiful, responsive design built with Next.js and Tailwind CSS

## 🏗️ Architecture

### Smart Contracts
- **TalentProfile.sol**: Manages user profile data on-chain
- **BountyBoard.sol**: Handles job postings and applications

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI components

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or other Web3 wallet
- Sepolia testnet ETH for testing

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd chaintalent
```

### 2. Install dependencies
```bash
# Install Hardhat dependencies
npm install

# Install Next.js dependencies
cd chaintalent-dapp
npm install
```

### 3. Environment Setup
Copy the environment template and fill in your values:
```bash
cp env.template .env.local
```

Required environment variables:
- `SEPOLIA_URL`: Your Infura/Alchemy Sepolia endpoint
- `PRIVATE_KEY`: Your wallet private key for deployment
- `ETHERSCAN_API_KEY`: Your Etherscan API key for contract verification

### 4. Compile Smart Contracts
```bash
# From the root directory
npm run compile
```

### 5. Deploy to Sepolia Testnet
```bash
npm run deploy
```

### 6. Start the Development Server
```bash
# From the chaintalent-dapp directory
npm run dev
```

## 🧪 Testing

Run the smart contract tests:
```bash
npm test
```

## 📱 Usage

1. **Connect Wallet**: Click the "Connect Wallet" button to connect your Web3 wallet
2. **Create Profile**: Set up your professional profile on-chain
3. **Browse Bounties**: View available job opportunities
4. **Apply for Jobs**: Submit applications for bounties
5. **Post Bounties**: Companies can post new job opportunities

## 🔧 Development

### Project Structure
```
chaintalent/
├── contracts/          # Smart contracts
├── scripts/           # Deployment scripts
├── test/              # Contract tests
├── chaintalent-dapp/  # Next.js frontend
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/# React components
│   │   └── providers/ # Web3 providers
│   └── public/        # Static assets
└── hardhat.config.js  # Hardhat configuration
```

### Available Scripts
- `npm run compile`: Compile smart contracts
- `npm run test`: Run contract tests
- `npm run deploy`: Deploy to Sepolia testnet
- `npm run dev`: Start Next.js development server

## 🌐 Networks

- **Development**: Hardhat local network
- **Testing**: Sepolia testnet
- **Production**: Ethereum mainnet (future)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔮 Roadmap

- [ ] Profile verification system
- [ ] Reputation scoring
- [ ] Advanced search and filtering
- [ ] Mobile app
- [ ] Integration with other blockchains
- [ ] DAO governance
