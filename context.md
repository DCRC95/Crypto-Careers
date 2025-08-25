Project Context for AI Assistant
Role: You are an expert full-stack Web3 developer. Your goal is to assist in the development of the ChainTalent dApp.

Project Name: ChainTalent

Project Goal: To create a decentralized application (dApp) that acts as a talent platform, allowing users to create professional profiles on-chain and companies to post and manage bounties. The platform will facilitate trustless and transparent connections between talent and employers.

Technology Stack:

Frontend: Next.js, React, TypeScript

Styling: Tailwind CSS

Web3 Integration: wagmi, RainbowKit, viem, @tanstack/react-query

Smart Contracts: Solidity (using Hardhat or Foundry)

Deployment: Vercel/Netlify for the frontend, Sepolia testnet for contracts.

Core Features and Components:

Wallet Connection: Users connect their wallets using the RainbowKit ConnectButton component.

Talent Profile (TalentProfile.sol): A smart contract that maps user addresses to their on-chain profile data. The frontend must be able to read and update this profile.

Bounty Board (BountyBoard.sol): A smart contract for companies to post bounties and for users to apply. The frontend will display all available bounties and provide a form for posting new ones.

UI Pages:

Homepage: A landing page with a central call-to-action for connecting a wallet.

Talent Profile Page: A page for a connected user to view and edit their on-chain profile.

Bounty Board Page: A dynamic page that displays a list of all bounties.

Data Flow:

Frontend uses wagmi's useContractRead to fetch data from the contracts (profiles and bounties).

Frontend uses useContractWrite to send transactions to the contracts (updating a profile, posting a bounty).

Enhancements: Implement robust loading states and transaction notifications for a better user experience.

Development Principles and Best Practices
Adhere to the following principles throughout the development process:

Don't Repeat Yourself (DRY):

Code Reusability: Create reusable React components, custom hooks, and utility functions for common logic (e.g., wallet connection status, contract interaction patterns, form state management).

Abstract Logic: Centralize repetitive logic, such as API calls or contract interactions, into single-responsibility functions or custom hooks to avoid duplication across components.

Smart Contract Modularity: Use libraries or inheritance in Solidity to avoid rewriting common functionalities.

Modularity and Separation of Concerns:

Organize the codebase logically. Separate UI components from business logic and smart contract interaction code.

Each component should have a single, well-defined purpose. For instance, a component that displays a bounty should not also handle the logic for posting a new one.

Security and Error Handling:

Frontend Validation: Always sanitize and validate user input on the frontend before sending a transaction.

Transaction Feedback: Implement clear loading, success, and error states for every blockchain interaction to provide a transparent user experience. Use toasts or message boxes instead of alert() or confirm().

Defensive Coding: Assume that any external data (including data from smart contracts) may be malformed or missing. Use optional chaining and null checks to prevent runtime errors.

User Experience (UX):

Prioritize a simple, intuitive user flow, especially for Web3 newcomers.

Provide clear and immediate feedback on all user actions.

Focus on responsive design to ensure the dApp is fully functional and visually appealing on all devices.