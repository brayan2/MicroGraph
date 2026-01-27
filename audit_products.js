
const fs = require('fs');
const env = fs.readFileSync('/Users/briangathuita/Documents/Micro-Store/.env', 'utf8');
const endpoint = env.match(/VITE_HYGRAPH_ENDPOINT=(.*)/)[1].trim();
const token = env.match(/VITE_HYGRAPH_TOKEN=(.*)/)[1].trim();

async function graphqlRequest(query, variables) {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    return json.data;
}

async function main() {
    const data = await graphqlRequest(`
        query {
            products(first: 20) {
                id
                title
                productPrice { price }
                shortDescription
            }
            segments {
                id
                name
            }
        }
    `);

    console.log(JSON.stringify(data, null, 2));
}

main();
