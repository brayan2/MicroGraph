
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
        // Don't throw immediately, let caller handle or ignore
        return null;
    }
    return json.data;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const authorNames = [
    "Elena Fisher", "Nathan Drake", "Lara Croft", "Geralt of Rivia", "Yennefer Vengerberg",
    "Jill Valentine", "Chris Redfield", "Leon Kennedy", "Claire Redfield", "Ada Wong"
];

const sellerNames = [
    "Urban Outfitters", "Tech Haven", "Cozy Corners", "Apex Gear", "Lumina Styles",
    "Nordic Trends", "Vintage Vault", "Modern Living", "Gadget Galaxy", "Prime Picks"
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log("Fetching existing content...");

    // 1. Fetch Blog Posts with their Authors
    const blogData = await graphqlRequest(`
    query {
      blogPosts(first: 100) { 
        id 
        title 
        blogAuthor { id authorName } 
      }
    }
  `);
    const posts = blogData?.blogPosts || [];

    // 2. Fetch Products with their Sellers
    const productData = await graphqlRequest(`
    query {
      products(first: 100) { 
        id 
        title 
        productSeller { id sellerName } 
      }
    }
  `);
    const products = productData?.products || [];

    // 3. Update Blog Authors
    let authorIndex = 0;
    for (const post of posts) {
        if (post.blogAuthor) {
            const newName = authorNames[authorIndex % authorNames.length];
            const newSlug = newName.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substr(2, 4);
            authorIndex++;

            console.log(`Updating Author for "${post.title}": ${post.blogAuthor.authorName} -> ${newName}`);

            const updateMutation = `
        mutation UpdateAuthor($id: ID!, $name: String!, $slug: String!) {
          updateBlogAuthor(
            where: { id: $id }
            data: { authorName: $name, authorSlug: $slug }
          ) { id }
        }
      `;

            const res = await graphqlRequest(updateMutation, { id: post.blogAuthor.id, name: newName, slug: newSlug });
            if (res) {
                await graphqlRequest(`mutation { publishBlogAuthor(where: { id: "${post.blogAuthor.id}" }, to: PUBLISHED) { id } }`);
            }
            await sleep(150);
        }
    }

    // 4. Update Product Sellers
    let sellerIndex = 0;
    for (const product of products) {
        if (product.productSeller) {
            const newName = sellerNames[sellerIndex % sellerNames.length];
            const newSlug = newName.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substr(2, 4);
            sellerIndex++;

            console.log(`Updating Seller for "${product.title}": ${product.productSeller.sellerName} -> ${newName}`);

            const updateMutation = `
        mutation UpdateSeller($id: ID!, $name: String!, $slug: String!) {
          updateProductSeller(
            where: { id: $id }
            data: { sellerName: $name, sellerSlug: $slug }
          ) { id }
        }
      `;

            const res = await graphqlRequest(updateMutation, { id: product.productSeller.id, name: newName, slug: newSlug });
            if (res) {
                await graphqlRequest(`mutation { publishProductSeller(where: { id: "${product.productSeller.id}" }, to: PUBLISHED) { id } }`);
            }
            await sleep(150);
        }
    }
}

main().catch(console.error);
