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
        console.log("   - Path: /reviews?productId={{id}}");
        console.log("--------------------------------------------------");

        console.log("\n[Note] Skipping automated creation to avoid token permission issues.");
        console.log("Please follow the steps above in your Hygraph Project Settings -> Remote Sources.");

    } catch (error) {
        console.error("Error during setup:", error);
    }
}

setup();
