const { ApolloClient, InMemoryCache, createHttpLink, gql } = require('@apollo/client');

// Test both endpoints
const ENDPOINTS = [
  {
    name: 'Old Deployment (Latest)',
    uri: 'https://api.studio.thegraph.com/query/108994/crypto-careers/version/latest'
  },
  {
    name: 'New Deployment (v0.0.5)',
    uri: 'https://api.studio.thegraph.com/query/108994/crypto-careers/v0.0.5'
  }
];

// Queries to test
const QUERIES = {
  talentProfiles: gql`
    query {
      talentProfiles(first: 5) {
        id
        name
        bio
        resumeHash
        skills
        createdAt
        updatedAt
      }
    }
  `,
  
  profileCreateds: gql`
    query {
      profileCreateds(first: 5, orderBy: timestamp, orderDirection: desc) {
        id
        user
        name
        bio
        resumeHash
        skills
        timestamp
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `,
  
  profileUpdateds: gql`
    query {
      profileUpdateds(first: 5, orderBy: timestamp, orderDirection: desc) {
        id
        user
        name
        bio
        resumeHash
        skills
        timestamp
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `,
  
  singleProfile: gql`
    query($id: ID!) {
      talentProfile(id: $id) {
        id
        name
        bio
        resumeHash
        skills
        createdAt
        updatedAt
      }
    }
  `
};

async function testEndpoint(endpoint, profileId) {
  console.log(`\n🔍 Testing: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.uri}`);
  console.log('   ' + '─'.repeat(60));
  
  const client = new ApolloClient({
    link: createHttpLink({ uri: endpoint.uri }),
    cache: new InMemoryCache(),
  });

  try {
    // Test 1: Get all talent profiles
    console.log('📊 1. Testing talentProfiles query...');
    const profilesResult = await client.query({
      query: QUERIES.talentProfiles,
      fetchPolicy: 'no-cache'
    });
    
    if (profilesResult.data && profilesResult.data.talentProfiles) {
      console.log(`   ✅ Found ${profilesResult.data.talentProfiles.length} profile(s)`);
      profilesResult.data.talentProfiles.forEach((profile, index) => {
        console.log(`      ${index + 1}. ID: ${profile.id}`);
        console.log(`         Name: "${profile.name}"`);
        console.log(`         Bio: "${profile.bio}"`);
        console.log(`         Resume: "${profile.resumeHash}"`);
        console.log(`         Skills: [${profile.skills.join(', ')}]`);
        console.log(`         Created: ${profile.createdAt ? new Date(Number(profile.createdAt) * 1000).toISOString() : 'N/A'}`);
      });
    } else {
      console.log('   ❌ No profiles found');
    }

    // Test 2: Get ProfileCreated events
    console.log('\n📋 2. Testing ProfileCreated events...');
    const createdResult = await client.query({
      query: QUERIES.profileCreateds,
      fetchPolicy: 'no-cache'
    });
    
    if (createdResult.data && createdResult.data.profileCreateds) {
      console.log(`   ✅ Found ${createdResult.data.profileCreateds.length} ProfileCreated event(s)`);
      createdResult.data.profileCreateds.forEach((event, index) => {
        console.log(`      ${index + 1}. User: ${event.user}`);
        console.log(`         Name: "${event.name}"`);
        console.log(`         Bio: "${event.bio}"`);
        console.log(`         Resume: "${event.resumeHash}"`);
        console.log(`         Skills: [${event.skills.join(', ')}]`);
        console.log(`         Time: ${new Date(Number(event.timestamp) * 1000).toISOString()}`);
      });
    } else {
      console.log('   ❌ No ProfileCreated events found');
    }

    // Test 3: Get ProfileUpdated events
    console.log('\n🔄 3. Testing ProfileUpdated events...');
    const updatedResult = await client.query({
      query: QUERIES.profileUpdateds,
      fetchPolicy: 'no-cache'
    });
    
    if (updatedResult.data && updatedResult.data.profileUpdateds) {
      console.log(`   ✅ Found ${updatedResult.data.profileUpdateds.length} ProfileUpdated event(s)`);
      updatedResult.data.profileUpdateds.forEach((event, index) => {
        console.log(`      ${index + 1}. User: ${event.user}`);
        console.log(`         Name: "${event.name}"`);
        console.log(`         Bio: "${event.bio}"`);
        console.log(`         Resume: "${event.resumeHash}"`);
        console.log(`         Skills: [${event.skills.join(', ')}]`);
        console.log(`         Time: ${new Date(Number(event.timestamp) * 1000).toISOString()}`);
      });
    } else {
      console.log('   ❌ No ProfileUpdated events found');
    }

    // Test 4: Get specific profile by ID
    if (profileId) {
      console.log('\n🎯 4. Testing single profile query...');
      const singleResult = await client.query({
        query: QUERIES.singleProfile,
        variables: { id: profileId },
        fetchPolicy: 'no-cache'
      });
      
      if (singleResult.data && singleResult.data.talentProfile) {
        const profile = singleResult.data.talentProfile;
        console.log(`   ✅ Found profile: ${profile.id}`);
        console.log(`      Name: "${profile.name}"`);
        console.log(`      Bio: "${profile.bio}"`);
        console.log(`      Resume: "${profile.resumeHash}"`);
        console.log(`      Skills: [${profile.skills.join(', ')}]`);
      } else {
        console.log('   ❌ Profile not found');
      }
    }

  } catch (error) {
    console.error(`   💥 Error: ${error.message}`);
    if (error.networkError) {
      console.error(`      Network Error: ${error.networkError.message}`);
    }
  }
  
  await client.clearStore();
}

async function debugProfileData() {
  console.log('🔍 Debugging Profile Data Across Deployments');
  console.log('=' .repeat(80));
  
  const profileId = '0x7e72ac838d13013a14693ca4e34b60c8b3670278';
  
  console.log(`🎯 Target Profile ID: ${profileId}`);
  console.log('=' .repeat(80));
  
  for (const endpoint of ENDPOINTS) {
    await testEndpoint(endpoint, profileId);
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('💡 Analysis:');
  console.log('   - If both deployments show empty data, the issue is in the smart contract events');
  console.log('   - If old deployment has data but new doesn\'t, it\'s a deployment sync issue');
  console.log('   - If new deployment has no events, it needs to index new profile updates');
  console.log('\n🔧 Next Steps:');
  console.log('   1. Update your profile on the blockchain to trigger new events');
  console.log('   2. Check if the smart contract is actually emitting full profile data');
  console.log('   3. Verify the subgraph is listening to the correct events');
}

// Run the script
if (require.main === module) {
  debugProfileData().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  debugProfileData,
  testEndpoint
};
