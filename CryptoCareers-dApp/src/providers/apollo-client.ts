import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create HTTP link for the subgraph endpoint
// This is the development URL - rate limited to 3,000 queries/day
const httpLink = createHttpLink({
  uri: 'https://api.studio.thegraph.com/query/108994/crypto-careers/0.0.08',
});

// Initialize Apollo Client with the link and cache
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
