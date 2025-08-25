const https = require('https');

// Test endpoints - we'll try multiple possibilities
const ENDPOINTS = [
  {
    name: "Original Endpoint",
    url: "https://api.studio.thegraph.com/query/108994/crypto-careers"
  },
  {
    name: "Bountyboard Endpoint", 
    url: "https://api.studio.thegraph.com/query/108994/bountyboard"
  },
  {
    name: "Alternative Format 1",
    url: "https://api.studio.thegraph.com/query/108994/chaintalent"
  },
  {
    name: "Alternative Format 2",
    url: "https://api.studio.thegraph.com/query/108994/talent-hub"
  }
];

// GraphQL queries to test
const QUERIES = {
  introspection: {
    name: "Introspection Query",
    query: `query { 
      __schema { 
        types { 
          name 
        } 
      } 
    }`
  },
  bounties: {
    name: "Bounties Query",
    query: `query { 
      bounties(orderBy: bountyId, orderDirection: desc) { 
        id 
        title 
        reward 
        issuer 
        applicants 
      } 
    }`
  },
  talentProfiles: {
    name: "Talent Profiles Query", 
    query: `query { 
      talentProfiles(orderBy: createdAt, orderDirection: asc) { 
        id 
        name 
        skills 
        bio 
      } 
    }`
  },
  simple: {
    name: "Simple Meta Query",
    query: `query { 
      _meta { 
        block { 
          number 
        } 
      } 
    }`
  }
};

// Function to make HTTP request
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: new URL(url).hostname,
      port: 443,
      path: new URL(url).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Test a single endpoint
async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing: ${endpoint.name}`);
  console.log(`🌐 URL: ${endpoint.url}`);
  console.log('─'.repeat(60));
  
  const results = {};
  
  for (const [key, query] of Object.entries(QUERIES)) {
    try {
      console.log(`\n📝 Testing: ${query.name}`);
      
      const response = await makeRequest(endpoint.url, {
        query: query.query
      });
      
      results[key] = {
        success: true,
        statusCode: response.statusCode,
        data: response.data
      };
      
      if (response.statusCode === 200) {
        console.log(`✅ Success (${response.statusCode})`);
        
        if (response.data.errors) {
          console.log(`⚠️  GraphQL Errors:`, response.data.errors);
        } else if (response.data.data) {
          console.log(`📊 Data received successfully`);
          
          // Show some data if it's introspection
          if (key === 'introspection' && response.data.data.__schema) {
            const types = response.data.data.__schema.types;
            const relevantTypes = types
              .filter(t => t.name.includes('Bounty') || t.name.includes('Talent') || t.name.includes('Profile'))
              .slice(0, 5);
            
            if (relevantTypes.length > 0) {
              console.log(`🔍 Relevant types found: ${relevantTypes.map(t => t.name).join(', ')}`);
            }
          }
        }
      } else {
        console.log(`❌ HTTP Error: ${response.statusCode}`);
        console.log(`📄 Response:`, response.data);
      }
      
    } catch (error) {
      console.log(`💥 Request failed: ${error.message}`);
      results[key] = {
        success: false,
        error: error.message
      };
    }
  }
  
  return results;
}

// Main test function
async function runComprehensiveTests() {
  console.log('🚀 Comprehensive GraphQL API Testing');
  console.log('=====================================');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔍 Testing multiple endpoints to find the correct one');
  
  const allResults = {};
  
  for (const endpoint of ENDPOINTS) {
    allResults[endpoint.name] = await testEndpoint(endpoint);
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  for (const [endpointName, results] of Object.entries(allResults)) {
    console.log(`\n📍 ${endpointName}:`);
    
    let successCount = 0;
    let totalCount = Object.keys(results).length;
    
    for (const [queryName, result] of Object.entries(results)) {
      if (result.success && result.statusCode === 200 && !result.data.errors) {
        successCount++;
        console.log(`   ✅ ${queryName}: Working`);
      } else if (result.success) {
        console.log(`   ⚠️  ${queryName}: HTTP ${result.statusCode}`);
      } else {
        console.log(`   ❌ ${queryName}: Failed`);
      }
    }
    
    console.log(`   📈 Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('='.repeat(60));
  
  const workingEndpoints = Object.entries(allResults)
    .filter(([name, results]) => 
      Object.values(results).some(r => r.success && r.statusCode === 200 && !r.data.errors)
    );
  
  if (workingEndpoints.length > 0) {
    console.log('✅ Working endpoints found!');
    workingEndpoints.forEach(([name, results]) => {
      console.log(`   - ${name}`);
    });
    console.log('\n🔧 Next steps:');
    console.log('   1. Use one of the working endpoints in your frontend');
    console.log('   2. Update the apollo-client.ts file with the correct URL');
    console.log('   3. Test your GraphQL queries in the browser');
  } else {
    console.log('❌ No working endpoints found');
    console.log('\n🔧 Next steps:');
    console.log('   1. Deploy your subgraph to The Graph Studio');
    console.log('   2. Check the deployment status in the dashboard');
    console.log('   3. Verify the correct endpoint URL');
    console.log('   4. Ensure the subgraph is syncing properly');
  }
  
  console.log('\n🔗 Useful Links:');
  console.log('   - The Graph Studio: https://thegraph.com/studio/');
  console.log('   - Subgraph Deployment Guide: https://thegraph.com/docs/en/deploying/deploying-a-subgraph/');
}

// Run the tests
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}

module.exports = {
  testEndpoint,
  runComprehensiveTests,
  ENDPOINTS,
  QUERIES
};
