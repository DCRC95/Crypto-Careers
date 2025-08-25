import { gql } from '@apollo/client/core';

// Query for bounty events (what's actually indexed in your subgraph)
export const GET_BOUNTY_EVENTS = gql`
  query GetBountyEvents($first: Int = 10, $skip: Int = 0) {
    bountyPosteds(
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: desc
    ) {
      id
      bountyId
      company
      title
      payment
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Query for talent profile events
export const GET_TALENT_PROFILE_EVENTS = gql`
  query GetTalentProfileEvents($first: Int = 10, $skip: Int = 0) {
    profileCreateds(
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: desc
    ) {
      id
      user
      name
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Query for the full TalentProfile entity (if it exists)
export const GET_TALENT_PROFILES = gql`
  query GetTalentProfiles($first: Int = 10, $skip: Int = 0) {
    talentProfiles(
      first: $first
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      name
      email
      telegram
      bio
      resumeHash
      skills
      createdAt
      updatedAt
    }
  }
`;

// Query for a specific talent profile by ID (wallet address)
export const GET_TALENT_PROFILE_BY_ID = gql`
  query GetTalentProfileById($id: ID!) {
    talentProfile(id: $id) {
      id
      name
      email
      telegram
      bio
      resumeHash
      skills
      createdAt
      updatedAt
    }
  }
`;

// Query for bounty applications
export const GET_BOUNTY_APPLICATIONS = gql`
  query GetBountyApplications($first: Int = 10, $skip: Int = 0) {
    applicationSubmitteds(
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: desc
    ) {
      id
      bountyId
      applicant
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Legacy queries (keeping for reference, but these won't work with current subgraph)
export const GET_BOUNTIES = gql`
  query {
    bounties(orderBy: bountyId, orderDirection: desc) {
      id
      title
      reward
      issuer
      applicants
    }
  }
`;
