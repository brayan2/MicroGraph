const { Client } = require('@hygraph/management-sdk');
require('dotenv').config();

const token = process.env.VITE_HYGRAPH_TOKEN;
const endpoint = process.env.VITE_HYGRAPH_ENDPOINT;

// Infer management URL from endpoint
// e.g. https://api-ap-southeast-2.hygraph.com/v2/cmfc5wvn401kl08v2so36gw1l/master
// -> https://management-ap-southeast-2.hygraph.com/graphql
const regionMatch = endpoint.match(/api-([\w-]+)\.hygraph\.com/);
const region = regionMatch ? regionMatch[1] : 'us-east-1'; // fallback
const managementUrl = `https://management-${region}.hygraph.com/graphql`;

console.log(`Connecting to Management API at: ${managementUrl}`);

const client = new Client({
    token: token,
    url: managementUrl,
});

async function setup() {
    try {
        console.log("Creating Remote Source...");

        // 1. Define the Custom Type for our Remote Source
        const remoteSourceSdl = `
            type RemoteReview {
                id: String!
                name: String!
                rating: Int!
                comment: String
            }
        `;

        // Note: Creating a remote source via SDK might vary slightly by version.
        // We'll use the generic mutation approach if needed, but SDK is preferred.

        // This is a simplified representation of adding a remote source.
        // In many cases, users prefer to do this in the UI because of the complex OAuth/Header configs.
        // However, we'll try to provide the parameters here.

        console.log("--------------------------------------------------");
        console.log("HYGRAPH CONFIGURATION PARAMETERS:");
        console.log("--------------------------------------------------");
        console.log("1. Add Remote Source (REST):");
        console.log("   - Display Name: Reviews API");
        console.log("   - API ID: reviewsApi");
        console.log("   - Base URL: https://micrograph.vercel.app/api");
        console.log("   - Custom Type Definition:");
        console.log(remoteSourceSdl);
        console.log("");
        console.log("2. Add Remote Field to 'Product' Model:");
        console.log("   - Display Name: External Reviews");
        console.log("   - API ID: externalReviews");
        console.log("   - Remote Source: Reviews API");
        console.log("   - Return Type: RemoteReview (List)");
        console.log("   - Method: GET");
        console.log("   - Path: reviews");
        console.log("   - Query Parameters:");
        console.log("     * Key: productId");
        console.log("     * Value: {{id}} (select 'id' field from Product model)");
        console.log("--------------------------------------------------");
        console.log("");
        console.log("IMPORTANT CONFIGURATION NOTES:");
        console.log("--------------------------------------------------");
        console.log("⚠️  Common Issues and Solutions:");
        console.log("");
        console.log("1. PATH CONFIGURATION:");
        console.log("   ❌ WRONG: /reviews (with leading slash)");
        console.log("   ❌ WRONG: /api/reviews (includes base URL path)");
        console.log("   ✅ CORRECT: reviews (no leading slash, relative to base URL)");
        console.log("");
        console.log("2. QUERY PARAMETER PLACEHOLDER:");
        console.log("   The {{id}} placeholder should reference the Product's 'id' field");
        console.log("   Alternative: {{productSlug}} if you want to use slug instead");
        console.log("   Make sure the field exists in your Product model");
        console.log("");
        console.log("3. TESTING THE REMOTE SOURCE:");
        console.log("   After configuration, test with these URLs:");
        console.log("   - Direct API: https://micrograph.vercel.app/api/reviews?productId=test");
        console.log("   - In Hygraph: Use the 'Test' button in Remote Source settings");
        console.log("");
        console.log("4. DEBUGGING ERRORS:");
        console.log("   If you see 'invalid character <' error:");
        console.log("   → The API is returning HTML instead of JSON");
        console.log("   → Check that the path is correct (no leading slash)");
        console.log("   → Verify productId is being passed correctly");
        console.log("   → Check Vercel deployment logs for 404 errors");
        console.log("");
        console.log("5. VERCEL DEPLOYMENT:");
        console.log("   Ensure /api/reviews.js is deployed:");
        console.log("   → Check vercel.json has correct rewrites");
        console.log("   → Verify the file exists in your deployment");
        console.log("   → Test the endpoint directly in a browser");
        console.log("--------------------------------------------------");
        console.log("");
        console.log("VERIFICATION STEPS:");
        console.log("--------------------------------------------------");
        console.log("1. Test API endpoint directly:");
        console.log("   curl 'https://micrograph.vercel.app/api/reviews?productId=test'");
        console.log("");
        console.log("2. In Hygraph, query a product with externalReviews:");
        console.log("   query {");
        console.log("     products(first: 1) {");
        console.log("       id");
        console.log("       title");
        console.log("       externalReviews {");
        console.log("         id");
        console.log("         name");
        console.log("         rating");
        console.log("         comment");
        console.log("       }");
        console.log("     }");
        console.log("   }");
        console.log("--------------------------------------------------");

        console.log("\n[Note] Skipping automated creation to avoid token permission issues.");
        console.log("Please follow the steps above in your Hygraph Project Settings -> Remote Sources.");

    } catch (error) {
        console.error("Error during setup:", error);
    }
}

setup();
