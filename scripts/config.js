
const endpoint = process.env.VITE_HYGRAPH_ENDPOINT || process.env.HYGRAPH_ENDPOINT;
const token = process.env.VITE_HYGRAPH_TOKEN || process.env.HYGRAPH_TOKEN;

if (!endpoint || !token) {
    console.error("Error: Missing environment variables.");
    console.error("Please ensure VITE_HYGRAPH_ENDPOINT and VITE_HYGRAPH_TOKEN are set in your .env file");
    console.error("and run the script with: node --env-file=.env scripts/manage.js <command>");
    process.exit(1);
}

/**
 * Generic helper to make GraphQL requests
 * @param {string} query - The GraphQL query or mutation
 * @param {object} variables - Variables for the query
 * @returns {Promise<any>} Response data or null on error
 */
async function graphqlRequest(query, variables = {}) {
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ query, variables })
        });
        const json = await res.json();
        if (json.errors) {
            console.error("GraphQL Errors:", JSON.stringify(json.errors, null, 2));
            return null;
        }
        return json.data;
    } catch (error) {
        console.error("Network or fetch error:", error);
        return null;
    }
}

module.exports = {
    endpoint,
    token,
    graphqlRequest
};
