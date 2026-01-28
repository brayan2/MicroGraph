#!/bin/bash

# Remote Reviews API - Diagnostics Script
# This script helps identify configuration issues with the Hygraph Remote Source

echo "=================================================="
echo "Remote Reviews API - Diagnostics"
echo "=================================================="
echo ""

echo "✅ Testing CORRECT endpoint (with /api):"
echo "URL: https://micrograph.vercel.app/api/reviews?productId=test"
response=$(curl -s -w "\n%{http_code}" "https://micrograph.vercel.app/api/reviews?productId=test")
http_code=$(echo "$response" | tail -n1)
content_type=$(curl -s -I "https://micrograph.vercel.app/api/reviews?productId=test" | grep -i "content-type" | tr -d '\r')

echo "  HTTP Status: $http_code"
echo "  $content_type"
if echo "$response" | head -n-1 | grep -q "{\|\""; then
    echo "  ✅ Returns valid JSON"
else
    echo "  ❌ Does not return JSON"
fi
echo ""

echo "❌ Testing INCORRECT endpoint (without /api):"
echo "URL: https://micrograph.vercel.app/reviews?productId=test"
response2=$(curl -s -w "\n%{http_code}" "https://micrograph.vercel.app/reviews?productId=test")
http_code2=$(echo "$response2" | tail -n1)
content_type2=$(curl -s -I "https://micrograph.vercel.app/reviews?productId=test" | grep -i "content-type" | tr -d '\r')

echo "  HTTP Status: $http_code2"
echo "  $content_type2"
if echo "$response2" | head -n-1 | grep -q "<!DOCTYPE\|<html"; then
    echo "  ❌ Returns HTML (THIS IS THE PROBLEM!)"
else
    echo "  ? Returns something else"
fi
echo ""

echo "=================================================="
echo "DIAGNOSIS"
echo "=================================================="
echo ""

if [ "$content_type" = "content-type: application/json; charset=utf-8" ]; then
    echo "✅ /api/reviews endpoint is working correctly"
else
    echo "❌ /api/reviews endpoint has issues"
fi

if echo "$content_type2" | grep -q "text/html"; then
    echo "❌ /reviews endpoint returns HTML (index.html SPA fallback)"
    echo ""
    echo "🔍 ROOT CAUSE IDENTIFIED:"
    echo "   Hygraph is calling /reviews instead of /api/reviews"
    echo ""
    echo "📋 SOLUTION:"
    echo "   In Hygraph Remote Source configuration:"
    echo "   ✅ Base URL: https://micrograph.vercel.app/api"
    echo "   ✅ Path: reviews"
    echo "   "
    echo "   OR"
    echo "   "
    echo "   ✅ Base URL: https://micrograph.vercel.app"
    echo "   ✅ Path: api/reviews"
    echo ""
    echo "   Current configuration is likely:"
    echo "   ❌ Base URL: https://micrograph.vercel.app"
    echo "   ❌ Path: reviews"
fi

echo ""
echo "=================================================="
echo "NEXT STEPS"
echo "=================================================="
echo ""
echo "1. Go to Hygraph: https://studio-ap-southeast-2.hygraph.com"
echo "2. Navigate to: Schema → Remote Sources → Reviews API"
echo "3. Check the configuration:"
echo "   - What is the Base URL?"
echo "   - What is the Path?"
echo "4. If Base URL is 'https://micrograph.vercel.app':"
echo "   → Change it to 'https://micrograph.vercel.app/api'"
echo "5. If Path is '/reviews' (with slash):"
echo "   → Change it to 'reviews' (no slash)"
echo "6. Save and test again"
echo ""
