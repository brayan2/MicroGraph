#!/bin/bash

# Test if the API is receiving the productId parameter correctly

echo "=================================================="
echo "Remote Reviews API - Parameter Test"
echo "=================================================="
echo ""

echo "Test 1: Without productId (current situation)"
echo "URL: https://micrograph.vercel.app/api/reviews"
echo ""
response1=$(curl -s "https://micrograph.vercel.app/api/reviews")
echo "Response: $response1"
echo ""

if [ "$response1" = "[]" ]; then
    echo "✅ API returns empty array (as expected)"
    echo "   This means API is working but needs productId"
else
    echo "❌ Unexpected response"
fi

echo ""
echo "=================================================="
echo ""

echo "Test 2: With productId (what Hygraph should send)"
echo "URL: https://micrograph.vercel.app/api/reviews?productId=test-product"
echo ""
response2=$(curl -s "https://micrograph.vercel.app/api/reviews?productId=test-product")
echo "Response (truncated):"
echo "$response2" | head -c 200
echo "..."
echo ""

if echo "$response2" | grep -q "\"id\""; then
    echo "✅ API returns reviews with productId"
    echo "   Hygraph needs to be configured to send this parameter"
else
    echo "❌ API did not return reviews"
fi

echo ""
echo "=================================================="
echo "DIAGNOSIS"
echo "=================================================="
echo ""

echo "Current Hygraph configuration is calling:"
echo "  https://micrograph.vercel.app/api/reviews"
echo "  (No productId parameter)"
echo ""
echo "It should be calling:"
echo "  https://micrograph.vercel.app/api/reviews?productId=<product-id>"
echo ""
echo "FIX: Add Input Argument in Hygraph Remote Field"
echo "  1. Edit 'externalReviews' field in Product model"
echo "  2. Look for 'Input arguments (optional)'"
echo "  3. Add argument:"
echo "     - API ID: productId"
echo "     - Type: String!"
echo "     - Source: id (from Product model)"
echo "  4. Save"
echo ""
echo "This will pass the product's ID as the productId query parameter."
echo ""
