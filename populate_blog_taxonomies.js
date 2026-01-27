
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
  const nodes = ["BestSeller", "NewArrival", "LimitedEdition"];

  // 1. Get existing Blog Posts
  const blogData = await graphqlRequest(`query { blogPosts { id title } }`);
  const posts = blogData.blogPosts || [];

  if (posts.length === 0) {
    console.log("No blog posts found.");
    return;
  }

  // 2. Assign taxonomies
  console.log("Assigning native taxonomy nodes to blog posts...");
  for (const post of posts) {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

    console.log(`  > Assigning "${randomNode}" to "${post.title}"`);
    try {
      await graphqlRequest(`
          mutation UpdatePost($id: ID!, $nodeId: String!) {
            updateBlogPost(
                where: { id: $id }
                data: { 
                    taxonomies: [ { value: $nodeId } ]
                }
            ) {
              id
            }
          }
        `, { id: post.id, nodeId: randomNode });

      await graphqlRequest(`mutation { publishBlogPost(where: { id: "${post.id}" }, to: PUBLISHED) { id } }`);
      console.log(`    Success!`);

    } catch (e) {
      console.error(`    FAILED: ${e.message}`);
    }
  }

  console.log("Done!");
}

main().catch(err => {
  console.error("FAILED:", err.message);
});
