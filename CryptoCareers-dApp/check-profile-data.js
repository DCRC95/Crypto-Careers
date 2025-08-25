const { ApolloClient, InMemoryCache, createHttpLink, gql } = require('@apollo/client');

// Create HTTP link for the subgraph endpoint
const httpLink = createHttpLink({
  uri: 'https://api.studio.thegraph.com/query/108994/crypto-careers/version/latest',
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Query to get all available data from talent profiles
const GET_FULL_TALENT_PROFILES = gql`
  query {
    talentProfiles(first: 10) {
      id
      name
      bio
      resumeHash
      skills
      createdAt
      updatedAt
    }
  }
`;

// Query to check what events are available
const GET_PROFILE_EVENTS = gql`
  query {
    profileCreateds(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      user
      name
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
    
    profileUpdateds(first: 5, orderBy: timestamp, orderDirection: desc) {
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

async function checkProfileData() {
  console.log('🔍 Checking Profile Data Availability');
  console.log('🌐 Endpoint: https://api.studio.thegraph.com/query/108994/crypto-careers/version/latest');
  console.log('=' .repeat(80));
  
  try {
    // First, check what profile data we can get
    console.log('📊 Checking Talent Profile Data...');
    const profileResult = await client.query({
      query: GET_FULL_TALENT_PROFILES,
      fetchPolicy: 'no-cache'
    });

    if (profileResult.data && profileResult.data.talentProfiles) {
      const profiles = profileResult.data.talentProfiles;
      console.log(`✅ Found ${profiles.length} talent profile(s)`);
      
      profiles.forEach((profile, index) => {
        console.log(`\n👤 Profile #${index + 1}:`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Name: ${profile.name || 'N/A'}`);
        console.log(`   Bio: "${profile.bio || 'N/A'}"`);
        console.log(`   Resume Hash: "${profile.resumeHash || 'N/A'}"`);
        console.log(`   Skills: ${profile.skills && profile.skills.length > 0 ? profile.skills.join(', ') : 'N/A'}`);
        console.log(`   Created: ${profile.createdAt ? new Date(Number(profile.createdAt) * 1000).toISOString() : 'N/A'}`);
        console.log(`   Updated: ${profile.updatedAt ? new Date(Number(profile.updatedAt) * 1000).toISOString() : 'N/A'}`);
      });
    }

    console.log('\n' + '=' .repeat(80));
    
    // Now check what events are available
    console.log('📋 Checking Available Events...');
    const eventsResult = await client.query({
      query: GET_PROFILE_EVENTS,
      fetchPolicy: 'no-cache'
    });

    if (eventsResult.data) {
      if (eventsResult.data.profileCreateds) {
        console.log(`\n🎯 ProfileCreated Events: ${eventsResult.data.profileCreateds.length}`);
        eventsResult.data.profileCreateds.forEach((event, index) => {
          console.log(`   ${index + 1}. User: ${event.user}, Name: ${event.name}, Time: ${new Date(Number(event.timestamp) * 1000).toISOString()}`);
        });
      }
      
      if (eventsResult.data.profileUpdateds) {
        console.log(`\n🔄 ProfileUpdated Events: ${eventsResult.data.profileUpdateds.length}`);
        eventsResult.data.profileUpdateds.forEach((event, index) => {
          console.log(`   ${index + 1}. User: ${event.user}, Name: ${event.name}, Time: ${new Date(Number(event.timestamp) * 1000).toISOString()}`);
        });
      }
    }

    console.log('\n' + '=' .repeat(80));
    console.log('💡 Analysis:');
    console.log('   - If bio/resume/skills show as empty strings, the data exists but is not being indexed');
    console.log('   - If they show as null/undefined, the data was never set');
    console.log('   - The ProfileCreated/Updated events only contain basic info (user, name, timestamp)');
    console.log('   - To get full profile data, you need to either:');
    console.log('     1. Update smart contract events to emit full data');
    console.log('     2. Modify subgraph to call contract functions for full data');
    console.log('     3. Create a separate event for profile data updates');

  } catch (error) {
    console.error('💥 Error checking profile data:', error.message);
    if (error.networkError) {
      console.error('   Network Error:', error.networkError.message);
    }
  } finally {
    await client.clearStore();
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  checkProfileData().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  checkProfileData
};
