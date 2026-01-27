
const fs = require('fs');

const endpoint = "https://api-ap-southeast-2.hygraph.com/v2/cmfc5wvn401kl08v2so36gw1l/master";
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NjQ2NjU5NzgsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aGVhc3QtMi5oeWdyYXBoLmNvbS92Mi9jbWZjNXd2bjQwMWtsMDh2MnNvMzZndzFsL21hc3RlciIsIm1hbmFnZW1lbnQtbmV4dC5ncmFwaGNtcy5jb20iXSwiaXNzIjoiaHR0cHM6Ly9tYW5hZ2VtZW50LWFwLXNvdXRoZWFzdC0yLmh5Z3JhcGguY29tLyIsInN1YiI6IjIwMmRlYzM2LTg2YjYtNDM3OC1hYmIwLTFiYzRjNjg4ZGQzOSIsImp0aSI6ImNtaW9jazczaDAxbmQwNzJ0MDF4ODM2dTcifQ.cbNOHhSkxNysJqx9gsY3pFFzoPkJOPx1AY_vR4EJJWRto4qG4RN-1y2YpeVR24aSGZ5rRMUjVHRfgFOe-xgdiVPCHQw36xrbzuTocGtWOr6eSPMuNm7uZDEuiWNdiGTbxMuzh0OvGN8tXLGcMsVUw3w6TFcLP3Rv5xAaXSISeN5OJL6_Cq7oT0SP9SP7KbcD1sVFYXCoC9DTchHbJYNd0I6CecOUH3Sy8mzuXr6YQxJ73FtoXQJwwefpY4Xg3rTLeOCl7JrAQ85tWe8qmMCuFEQdUXU2kMY9Ok9nVIQDL7ZdoLpftW89giihrJivqv6CTOBADV8XUu5VLMeXbLuSBRb4xmcbDOIX0_7THK_gZAolKQ3KZdbxgrNd1246Mv1P472SwFLCc0Hs3jpalxGBCk9Za4DtHEEGpmb96u84VCpna-a7g2LoHiZZMcOZYXMpJi1iRwVJKk_1Ij87_SCM9OFme9rWG0AM_-3qI0wSbq3O8oFfhLVqU8kFu7yYa5n-XO8VqzuFsVVnc1V0UukJ9Mv1KrOt7Y_DgWebT0DO5WcMfr9wCijcutP3jUFjVKQYE7qSX3VsigJngPdDeY0vDDujWK4pTdvg9V14MpQPKUcVShpJU0gweTmOboVZp6VGHwxVAN5dhUrdOiLawnPRhSyVHSZUt-lTovHUY3iaZgQ";

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
        throw new Error(json.errors[0].message);
    }
    return json.data;
}

async function main() {
    // 1. Create Taxonomies if they dont exist (trending already exists)
    const taxonomies = [
        { displayName: "New Arrival", apiId: "new-arrival" },
        { displayName: "Best Seller", apiId: "best-seller" },
        { displayName: "Limited Edition", apiId: "limited-edition" }
    ];

    const taxonomyIds = [];

    // Get existing Trending ID
    const existing = await graphqlRequest(`query { taxonomies { id apiId } }`);
    existing.taxonomies.forEach(t => taxonomyIds.push(t.id));

    for (const tax of taxonomies) {
        console.log(`Creating taxonomy: ${tax.displayName}`);
        try {
            const res = await graphqlRequest(`
          mutation CreateTaxonomy($name: String!, $apiId: String!) {
            createTaxonomy(data: { displayName: $name, apiId: $apiId }) {
              id
            }
          }
        `, { name: tax.displayName, apiId: tax.apiId });
            taxonomyIds.push(res.createTaxonomy.id);
            await graphqlRequest(`mutation { publishTaxonomy(where: { id: "${res.createTaxonomy.id}" }, to: PUBLISHED) { id } }`);
        } catch (e) {
            console.warn(`Taxonomy ${tax.apiId} might already exist or failed.`);
        }
    }

    // 2. Fetch some products and blog posts
    const content = await graphqlRequest(`
    query {
      products(first: 5) { id }
      blogPosts(first: 5) { id }
    }
  `);

    const products = content.products || [];
    const posts = content.blogPosts || [];

    // 3. Connect taxonomies to content
    console.log("Connecting taxonomies to products...");
    for (const product of products) {
        const randomTaxId = taxonomyIds[Math.floor(Math.random() * taxonomyIds.length)];
        await graphqlRequest(`
      mutation ConnectProductTaxonomy($productId: ID!, $taxId: ID!) {
        updateProduct(
          where: { id: $productId },
          data: { taxonomies: { connect: { where: { id: $taxId } } } }
        ) {
          id
        }
      }
    `, { productId: product.id, taxId: randomTaxId });
        await graphqlRequest(`mutation { publishProduct(where: { id: "${product.id}" }, to: PUBLISHED) { id } }`);
    }

    console.log("Connecting taxonomies to blog posts...");
    for (const post of posts) {
        const randomTaxId = taxonomyIds[Math.floor(Math.random() * taxonomyIds.length)];
        await graphqlRequest(`
      mutation ConnectBlogPostTaxonomy($postId: ID!, $taxId: ID!) {
        updateBlogPost(
          where: { id: $postId },
          data: { taxonomies: { connect: { where: { id: $taxId } } } }
        ) {
          id
        }
      }
    `, { postId: post.id, taxId: randomTaxId });
        await graphqlRequest(`mutation { publishBlogPost(where: { id: "${post.id}" }, to: PUBLISHED) { id } }`);
    }

    console.log("Done!");
}

main().catch(err => {
    console.error("FAILED:", err.message);
});
