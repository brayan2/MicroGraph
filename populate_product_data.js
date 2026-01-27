
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

function generateSKU(title, index) {
    const prefix = title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    return `${prefix}-${String(index).padStart(4, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateShortDescription(title) {
    const templates = [
        `Premium ${title} crafted with attention to detail and quality materials.`,
        `Essential ${title} designed for everyday use with lasting durability.`,
        `High-quality ${title} that combines style and functionality perfectly.`,
        `Modern ${title} featuring sleek design and superior craftsmanship.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

function generateDescription(title) {
    return {
        children: [
            {
                type: "paragraph",
                children: [{
                    text: `This ${title} represents the perfect blend of quality craftsmanship and modern design. Made from premium materials, it's built to last while maintaining an elegant aesthetic that fits seamlessly into any environment. Whether you're looking for reliability or style, this product delivers on both fronts.`
                }]
            },
            {
                type: "paragraph",
                children: [{
                    text: `Every detail has been carefully considered, from the choice of materials to the finishing touches. We stand behind the quality of our products and are confident that this ${title} will exceed your expectations. Experience the difference that genuine quality makes in your daily life.`
                }]
            }
        ]
    };
}

async function main() {
    console.log("Fetching all products...\n");

    const data = await graphqlRequest(`
    query {
      products(first: 100) {
        id
        title
        productSlug
        productSku
        shortDescription
        productDescription { text }
      }
    }
  `);

    if (!data?.products) {
        console.error("Failed to fetch products");
        return;
    }

    const products = data.products;
    console.log(`Found ${products.length} products\n`);

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`\n[${i + 1}/${products.length}] Processing: ${product.title}`);

        let updated = false;

        // Update SKU
        if (!product.productSku) {
            const newSKU = generateSKU(product.title, i + 1);
            console.log(`  ✓ Adding SKU: ${newSKU}`);
            const result = await graphqlRequest(`
        mutation {
          updateProduct(
            where: { id: "${product.id}" }
            data: { productSku: "${newSKU}" }
          ) { id }
        }
      `);
            if (result) updated = true;
            await sleep(100);
        } else {
            console.log(`  → SKU exists: ${product.productSku}`);
        }

        // Update short description
        if (!product.shortDescription) {
            const desc = generateShortDescription(product.title);
            console.log(`  ✓ Adding short description`);
            const escaped = desc.replace(/"/g, '\\"').replace(/'/g, "\\'");
            const result = await graphqlRequest(`
        mutation {
          updateProduct(
            where: { id: "${product.id}" }
            data: { shortDescription: "${escaped}" }
          ) { id }
        }
      `);
            if (result) updated = true;
            await sleep(100);
        } else {
            console.log(`  → Short description exists`);
        }

        // Update main description
        if (!product.productDescription || !product.productDescription.text) {
            const desc = generateDescription(product.title);
            console.log(`  ✓ Adding main description (2 paragraphs)`);

            const mutation = `
        mutation UpdateProductDescription($id: ID!, $description: RichTextAST!) {
          updateProduct(
            where: { id: $id }
            data: { productDescription: $description }
          ) { id }
        }
      `;

            const result = await graphqlRequest(mutation, {
                id: product.id,
                description: desc
            });
            if (result) updated = true;
            await sleep(100);
        } else {
            console.log(`  → Main description exists`);
        }

        if (updated) {
            await graphqlRequest(`mutation { publishProduct(where: { id: "${product.id}" }, to: PUBLISHED) { id } }`);
            console.log(`  ✓ Published`);
        }
    }

    console.log("\n✅ Done! All products updated.");
}

main().catch(console.error);
