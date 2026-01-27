
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
        return null;
    }
    return json.data;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("Fetching all products...");

    const data = await graphqlRequest(`
    query {
      products(first: 100) {
        id
        title
        relatedProducts {
          id
          product { id }
        }
      }
    }
  `);

    if (!data?.products) {
        console.log("Failed to fetch products");
        return;
    }

    const products = data.products;
    const allIds = products.map(p => p.id);
    console.log(`Found ${products.length} products.\n`);

    for (const product of products) {
        const hasRelated = product.relatedProducts?.product?.length > 0;

        if (hasRelated) {
            console.log(`✓ ${product.title}: Has ${product.relatedProducts.product.length} related`);
            continue;
        }

        // Pick 3 random other products
        const otherIds = allIds.filter(id => id !== product.id);
        const shuffled = otherIds.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        const connectString = selected.map(id => `{ id: "${id}" }`).join(", ");

        console.log(`> ${product.title}: Adding 3 related products...`);

        // Use upsert pattern - delete existing and create new
        if (product.relatedProducts) {
            // Delete existing empty wrapper first
            await graphqlRequest(`
        mutation {
          updateProduct(
            where: { id: "${product.id}" }
            data: { relatedProducts: { delete: true } }
          ) { id }
        }
      `);
            await sleep(100);
        }

        // Create new with connected products
        const result = await graphqlRequest(`
      mutation {
        updateProduct(
          where: { id: "${product.id}" }
          data: {
            relatedProducts: {
              create: {
                product: { connect: [${connectString}] }
              }
            }
          }
        ) { id }
      }
    `);

        if (result) {
            await graphqlRequest(`mutation { publishProduct(where: { id: "${product.id}" }, to: PUBLISHED) { id } }`);
            console.log(`  ✓ Done`);
        } else {
            console.log(`  ✗ Failed`);
        }

        await sleep(200);
    }

    console.log("\n✅ All products processed!");
}

main().catch(console.error);
