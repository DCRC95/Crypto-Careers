const { ApolloClient, InMemoryCache, createHttpLink, gql } = require('@apollo/client');

// Create HTTP link for the subgraph endpoint
const httpLink = createHttpLink({
  uri: 'https://api.studio.thegraph.com/query/108994/crypto-careers/v0.0.6',
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Comprehensive talent profiles query with all fields
const GET_ALL_TALENT_PROFILES = gql`
  query {
    talentProfiles(orderBy: createdAt, orderDirection: desc) {
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

// Function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Function to truncate long text
function truncateText(text, maxLength = 100) {
  if (!text) return 'None';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Main function to pull and display talent profiles
async function pullTalentProfiles() {
  console.log('🎯 Pulling Talent Profile Data from GraphQL Subgraph');
  console.log('🌐 Endpoint: https://api.studio.thegraph.com/query/108994/crypto-careers');
  console.log('⏰ Started at:', new Date().toLocaleString('en-GB'));
  console.log('=' .repeat(80));
  
  try {
    const { data, errors } = await client.query({
      query: GET_ALL_TALENT_PROFILES,
      fetchPolicy: 'no-cache'
    });

    if (errors) {
      console.error('❌ GraphQL Errors:');
      errors.forEach(error => {
        console.error(`   - ${error.message}`);
      });
      return;
    }

    const profiles = data.talentProfiles || [];
    
    if (profiles.length === 0) {
      console.log('ℹ️  No talent profiles found in the subgraph');
      console.log('💡 This could mean:');
      console.log('   - No profiles have been created yet');
      console.log('   - The subgraph hasn\'t indexed any profile creation events');
      console.log('   - There might be an issue with the subgraph indexing');
      return;
    }

    console.log(`✅ Successfully retrieved ${profiles.length} talent profile(s)`);
    console.log('=' .repeat(80));
    
    // Display summary statistics
    const profilesWithSkills = profiles.filter(p => p.skills && p.skills.length > 0);
    const profilesWithBio = profiles.filter(p => p.bio && p.bio.trim() !== '');
    const profilesWithResume = profiles.filter(p => p.resumeHash && p.resumeHash.trim() !== '');
    
    console.log('📊 Summary Statistics:');
    console.log(`   Total Profiles: ${profiles.length}`);
    console.log(`   Profiles with Skills: ${profilesWithSkills.length}`);
    console.log(`   Profiles with Bio: ${profilesWithBio.length}`);
    console.log(`   Profiles with Resume: ${profilesWithResume.length}`);
    console.log('=' .repeat(80));

    // Display detailed profile information
    profiles.forEach((profile, index) => {
      console.log(`\n👤 Profile #${index + 1}`);
      console.log('   ' + '─'.repeat(60));
      console.log(`   🆔 ID: ${profile.id}`);
      console.log(`   📛 Name: ${profile.name || 'Anonymous'}`);
      console.log(`   📝 Bio: ${truncateText(profile.bio, 120)}`);
      console.log(`   📄 Resume Hash: ${profile.resumeHash || 'No resume uploaded'}`);
      console.log(`   🕒 Created: ${formatTimestamp(profile.createdAt)}`);
      console.log(`   🔄 Updated: ${formatTimestamp(profile.updatedAt)}`);
      
      if (profile.skills && profile.skills.length > 0) {
        console.log(`   🛠️  Skills (${profile.skills.length}):`);
        profile.skills.forEach((skill, skillIndex) => {
          console.log(`      ${skillIndex + 1}. ${skill}`);
        });
      } else {
        console.log(`   🛠️  Skills: None specified`);
      }
    });

    console.log('\n' + '=' .repeat(80));
    console.log('🎉 Talent profile data retrieval completed successfully!');
    console.log('⏰ Finished at:', new Date().toLocaleString('en-GB'));

  } catch (error) {
    console.error('💥 Error fetching talent profiles:');
    console.error(`   Message: ${error.message}`);
    
    if (error.networkError) {
      console.error('   Network Error Details:');
      console.error(`     Status Code: ${error.networkError.statusCode || 'Unknown'}`);
      console.error(`     Message: ${error.networkError.message || 'No message'}`);
    }
    
    if (error.graphQLErrors) {
      console.error('   GraphQL Errors:');
      error.graphQLErrors.forEach(graphQLError => {
        console.error(`     - ${graphQLError.message}`);
      });
    }
  } finally {
    // Clean up
    await client.clearStore();
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  pullTalentProfiles().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  pullTalentProfiles,
  formatTimestamp,
  truncateText
};
