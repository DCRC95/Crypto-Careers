#!/bin/bash

# GraphQL endpoint
ENDPOINT="https://api.studio.thegraph.com/query/108994/crypto-careers"

echo "🚀 Testing GraphQL API Endpoints"
echo "🌐 Endpoint: $ENDPOINT"
echo "⏰ Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "============================================================"

# Test 1: Subgraph Health Check (Introspection)
echo ""
echo "🏥 Test 1: Subgraph Health Check"
echo "--------------------------------"
INTROSPECTION_QUERY='{"query":"query { __schema { types { name } } }"}'

echo "Query: Introspection"
echo "Response:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$INTROSPECTION_QUERY" \
  "$ENDPOINT" | jq '.' 2>/dev/null || curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$INTROSPECTION_QUERY" \
  "$ENDPOINT"

# Test 2: Bounties Query
echo ""
echo "🔍 Test 2: Bounties Query"
echo "-------------------------"
BOUNTIES_QUERY='{"query":"query { bounties(orderBy: bountyId, orderDirection: desc) { id title reward issuer applicants } }"}'

echo "Query: Get Bounties"
echo "Response:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$BOUNTIES_QUERY" \
  "$ENDPOINT" | jq '.' 2>/dev/null || curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$BOUNTIES_QUERY" \
  "$ENDPOINT"

# Test 3: Talent Profiles Query
echo ""
echo "👥 Test 3: Talent Profiles Query"
echo "--------------------------------"
PROFILES_QUERY='{"query":"query { talentProfiles(orderBy: createdAt, orderDirection: asc) { id name skills bio } }"}'

echo "Query: Get Talent Profiles"
echo "Response:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$PROFILES_QUERY" \
  "$ENDPOINT" | jq '.' 2>/dev/null || curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$PROFILES_QUERY" \
  "$ENDPOINT"

# Test 4: Simple Query Test
echo ""
echo "🧪 Test 4: Simple Query Test"
echo "----------------------------"
SIMPLE_QUERY='{"query":"query { _meta { block { number } } }"}'

echo "Query: Get Block Number"
echo "Response:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$SIMPLE_QUERY" \
  "$ENDPOINT" | jq '.' 2>/dev/null || curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$SIMPLE_QUERY" \
  "$ENDPOINT"

echo ""
echo "🎉 All tests completed!"
echo "============================================================"
echo ""
echo "💡 Tips:"
echo "   - If you see 'jq' errors, install jq for better formatting: brew install jq"
echo "   - Check the responses above for any error messages"
echo "   - Verify the endpoint URL is correct"
echo "   - Ensure your subgraph is deployed and syncing"
