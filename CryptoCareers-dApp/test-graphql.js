const { ApolloClient, InMemoryCache, createHttpLink, gql } = require('@apollo/client');

// Create HTTP link for the subgraph endpoint
const httpLink = createHttpLink({
  uri: 'https://api.studio.thegraph.com/query/108994/crypto-careers',
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// GraphQL queries
const GET_BOUNTIES = gql`
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

const GET_TALENT_PROFILES = gql`
  query {
    talentProfiles(orderBy: createdAt, orderDirection: asc) {
      id
      name
      skills
      bio
    }
  }
`;

// Test function for bounties
async function testBounties() {
  console.log('🔍 Testing Bounties Query...');
  console.log('=' .repeat(50));
  
  try {
    const { data, errors } = await client.query({
      query: GET_BOUNTIES,
      fetchPolicy: 'no-cache' // Don't use cache for testing
    });

    if (errors) {
      console.error('❌ GraphQL Errors:', errors);
      return;
    }

    console.log('✅ Bounties Query Successful!');
    console.log(`📊 Found ${data.bounties?.length || 0} bounties`);
    
    if (data.bounties && data.bounties.length > 0) {
      console.log('\n📋 Bounties Data:');
      data.bounties.forEach((bounty, index) => {
        console.log(`\n${index + 1}. Bounty ID: ${bounty.id}`);
        console.log(`   Title: ${bounty.title || 'No title'}`);
        console.log(`   Reward: ${bounty.reward ? `${bounty.reward} ETH` : 'Not specified'}`);
        console.log(`   Issuer: ${bounty.issuer || 'Unknown'}`);
        console.log(`   Applicants: ${bounty.applicants ? bounty.applicants.length : 0}`);
      });
    } else {
      console.log('ℹ️  No bounties found in the subgraph');
    }
  } catch (error) {
    console.error('❌ Error fetching bounties:', error.message);
    if (error.networkError) {
      console.error('   Network Error Details:', error.networkError);
    }
  }
}

// Test function for talent profiles
async function testTalentProfiles() {
  console.log('\n🔍 Testing Talent Profiles Query...');
  console.log('=' .repeat(50));
  
  try {
    const { data, errors } = await client.query({
      query: GET_TALENT_PROFILES,
      fetchPolicy: 'no-cache' // Don't use cache for testing
    });

    if (errors) {
      console.error('❌ GraphQL Errors:', errors);
      return;
    }

    console.log('✅ Talent Profiles Query Successful!');
    console.log(`📊 Found ${data.talentProfiles?.length || 0} talent profiles`);
    
    if (data.talentProfiles && data.talentProfiles.length > 0) {
      console.log('\n👥 Talent Profiles Data:');
      data.talentProfiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
        console.log(`   Name: ${profile.name || 'Anonymous'}`);
        console.log(`   Bio: ${profile.bio || 'No bio'}`);
        if (profile.skills && profile.skills.length > 0) {
          console.log(`   Skills: ${profile.skills.join(', ')}`);
        } else {
          console.log(`   Skills: None specified`);
        }
      });
    } else {
      console.log('ℹ️  No talent profiles found in the subgraph');
    }
  } catch (error) {
    console.error('❌ Error fetching talent profiles:', error.message);
    if (error.networkError) {
      console.error('   Network Error Details:', error.networkError);
    }
  }
}

// Test function for subgraph health
async function testSubgraphHealth() {
  console.log('🏥 Testing Subgraph Health...');
  console.log('=' .repeat(50));
  
  try {
    // Simple introspection query to test if the endpoint is working
    const introspectionQuery = gql`
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;

    const { data, errors } = await client.query({
      query: introspectionQuery,
      fetchPolicy: 'no-cache'
    });

    if (errors) {
      console.error('❌ Introspection Errors:', errors);
      return;
    }

    console.log('✅ Subgraph is healthy and responding!');
    console.log(`📊 Available types: ${data.__schema.types.length}`);
    
    // Show some available types
    const relevantTypes = data.__schema.types
      .filter(type => type.name.includes('Bounty') || type.name.includes('Talent') || type.name.includes('Profile'))
      .slice(0, 10);
    
    if (relevantTypes.length > 0) {
      console.log('\n🔍 Relevant types found:');
      relevantTypes.forEach(type => {
        console.log(`   - ${type.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Subgraph health check failed:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting GraphQL API Tests...');
  console.log('🌐 Endpoint: https://api.studio.thegraph.com/query/108994/crypto-careers');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('=' .repeat(60));
  
  try {
    await testSubgraphHealth();
    await testBounties();
    await testTalentProfiles();
    
    console.log('\n🎉 All tests completed!');
    console.log('=' .repeat(60));
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  } finally {
    // Close the client
    await client.clearStore();
    process.exit(0);
  }
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testBounties,
  testTalentProfiles,
  testSubgraphHealth,
  runAllTests
};
