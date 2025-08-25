const { ApolloClient, InMemoryCache, createHttpLink, gql } = require('@apollo/client');

// Common endpoint patterns to test
const ENDPOINTS_TO_TEST = [
  'https://api.studio.thegraph.com/query/108994/crypto-careers',
  'https://api.studio.thegraph.com/query/108994/bountyboard',
  'https://api.studio.thegraph.com/query/108994/cryptocareers',
  'https://api.studio.thegraph.com/query/108994/chain-talent',
  'https://api.studio.thegraph.com/query/108994/chaintalent',
  'https://api.studio.thegraph.com/query/108994/bounty-board',
  'https://api.studio.thegraph.com/query/108994/bountyboard',
  'https://api.studio.thegraph.com/query/108994/talent-profile',
  'https://api.studio.thegraph.com/query/108994/talentprofile'
];

// Simple introspection query
const INTROSPECTION_QUERY = gql`
  query {
    __schema {
      types {
        name
      }
    }
  }
`;

// Test talent profiles query
const TALENT_PROFILES_QUERY = gql`
  query {
    talentProfiles(first: 5) {
      id
      name
      bio
      skills
    }
  }
`;

async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing endpoint: ${endpoint}`);
  
  try {
    const client = new ApolloClient({
      link: createHttpLink({ uri: endpoint }),
      cache: new InMemoryCache(),
    });

    // Test introspection first
    const introspectionResult = await client.query({
      query: INTROSPECTION_QUERY,
      fetchPolicy: 'no-cache'
    });

    if (introspectionResult.data && introspectionResult.data.__schema) {
      console.log(`✅ Endpoint is working! Found ${introspectionResult.data.__schema.types.length} types`);
      
      // Look for relevant types
      const relevantTypes = introspectionResult.data.__schema.types.filter(type => 
        type.name.includes('Talent') || 
        type.name.includes('Bounty') || 
        type.name.includes('Profile')
      );
      
      if (relevantTypes.length > 0) {
        console.log(`🎯 Found relevant types: ${relevantTypes.map(t => t.name).join(', ')}`);
      }
      
      // Now test the talent profiles query
      try {
        const talentResult = await client.query({
          query: TALENT_PROFILES_QUERY,
          fetchPolicy: 'no-cache'
        });
        
        if (talentResult.data && talentResult.data.talentProfiles) {
          console.log(`👥 Talent profiles query successful! Found ${talentResult.data.talentProfiles.length} profiles`);
          
          if (talentResult.data.talentProfiles.length > 0) {
            console.log('📋 Sample profile data:');
            talentResult.data.talentProfiles.forEach((profile, index) => {
              console.log(`   ${index + 1}. ID: ${profile.id}, Name: ${profile.name || 'N/A'}`);
            });
          }
        }
        
        console.log(`\n🎉 SUCCESS! This is the working endpoint: ${endpoint}`);
        return { success: true, endpoint, data: talentResult.data };
        
      } catch (talentError) {
        console.log(`⚠️  Endpoint works but talent profiles query failed: ${talentError.message}`);
        return { success: true, endpoint, error: talentError.message };
      }
      
    } else {
      console.log(`❌ Endpoint responded but no schema found`);
      return { success: false, endpoint, error: 'No schema' };
    }
    
  } catch (error) {
    if (error.networkError) {
      console.log(`❌ Network error: ${error.networkError.statusCode || 'Unknown'} - ${error.networkError.message || 'No message'}`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    return { success: false, endpoint, error: error.message };
  }
}

async function findWorkingEndpoint() {
  console.log('🔍 Finding the correct GraphQL endpoint for your deployed subgraph...');
  console.log('=' .repeat(80));
  
  const results = [];
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // If we found a working endpoint, we can stop
    if (result.success && result.data) {
      break;
    }
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('📊 Summary of endpoint tests:');
  
  const workingEndpoints = results.filter(r => r.success);
  const failedEndpoints = results.filter(r => !r.success);
  
  if (workingEndpoints.length > 0) {
    console.log(`✅ Working endpoints: ${workingEndpoints.length}`);
    workingEndpoints.forEach(result => {
      console.log(`   - ${result.endpoint}`);
      if (result.error) {
        console.log(`     Warning: ${result.error}`);
      }
    });
  }
  
  if (failedEndpoints.length > 0) {
    console.log(`❌ Failed endpoints: ${failedEndpoints.length}`);
    failedEndpoints.forEach(result => {
      console.log(`   - ${result.endpoint}: ${result.error}`);
    });
  }
  
  if (workingEndpoints.length === 0) {
    console.log('\n💡 No working endpoints found. Please check:');
    console.log('   1. Your subgraph deployment status in The Graph Studio');
    console.log('   2. The correct project ID and subgraph name');
    console.log('   3. Whether the subgraph has finished syncing');
    console.log('\n🔗 The Graph Studio: https://thegraph.com/studio/');
  }
  
  return results;
}

// Run the script
if (require.main === module) {
  findWorkingEndpoint().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  findWorkingEndpoint,
  testEndpoint
};
