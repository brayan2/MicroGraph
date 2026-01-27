const fs = require('fs');

const taxScript = fs.readFileSync('create_hygraph_taxonomies.js', 'utf8');
const tokenMatch = taxScript.match(/const token = "(.*?)";/);
const token = tokenMatch ? tokenMatch[1].trim() : '';
const endpoint = "https://management-ap-southeast-2.hygraph.com/graphql";

// The project ID seems to be implicit from the token or environment, BUT...
// create_hygraph_taxonomies.js passed modelId to fields.
// For createLocale, we might not need modelId, or maybe we need projectId?
// Usually createLocale is global for the project.

async function graphqlRequest(query, variables) {
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
        console.error("GraphQL Error:", JSON.stringify(json.errors, null, 2));
        return null;
    }
    return json.data;
}

async function addLocale(apiId, displayName) {
    console.log(`Adding locale: ${displayName} (${apiId})...`);
    // Pass environmentId if needed? create_hygraph_taxonomies.js used environmentId var but didn't seem to pass it in query vars for createSimpleField?
    // Wait, create_hygraph_taxonomies.js passed { modelId: ... }

    // I'll try adding environmentId to variables just in case, provided I can find it.
    // The environmentId in create_hygraph_taxonomies.js was "916b8750829a40d5b01bee809e3bd72b"
    const environmentId = "916b8750829a40d5b01bee809e3bd72b";

    const query = `
      mutation CreateLocale($apiId: String!, $displayName: String!) {
        createLocale(data: {
          apiId: $apiId,
          displayName: $displayName
        }) {
          migration {
            id
          }
        }
      }
    `;

    await graphqlRequest(query, { apiId, displayName });
}

async function main() {
    await addLocale('de', 'German');
    await addLocale('fr', 'French');
    await addLocale('es', 'Spanish');
}

main();
