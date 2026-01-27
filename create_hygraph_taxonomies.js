
const fs = require('fs');

const endpoint = "https://management-ap-southeast-2.hygraph.com/graphql";
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
    const msg = json.errors[0].message;
    if (msg.includes("already exists") || msg.includes("is already used") || msg.includes("already been taken")) {
      console.warn("  > Already exists, skipping.");
      return { alreadyExists: true };
    }
    console.error("GraphQL Error:", JSON.stringify(json.errors, null, 2));
    throw new Error(msg);
  }
  return json.data;
}

async function main() {
  const environmentId = "916b8750829a40d5b01bee809e3bd72b";
  const taxonomyModelId = "562126526e5e47759eeb1f86ca18c2a0";
  const productModelId = "f8c728b1bc67420fa836622e6e409bae";
  const blogPostModelId = "7c1cc5875e604419a5389f9338f8f6cb";

  console.log("1. Adding displayName field to Taxonomy...");
  await graphqlRequest(`
    mutation CreateDisplayNameField($modelId: ID!) {
      createSimpleField(data: {
        modelId: $modelId,
        apiId: "displayName",
        displayName: "Display Name",
        type: STRING,
        isRequired: true,
        isUnique: false,
        isList: false,
        isLocalized: false
      }) {
        migration { id }
      }
    }
  `, { modelId: taxonomyModelId });

  console.log("2. Adding apiId field to Taxonomy...");
  await graphqlRequest(`
    mutation CreateApiIdField($modelId: ID!) {
      createSimpleField(data: {
        modelId: $modelId,
        apiId: "apiId",
        displayName: "API ID",
        type: STRING,
        isRequired: true,
        isUnique: true,
        isList: false,
        isLocalized: false
      }) {
        migration { id }
      }
    }
  `, { modelId: taxonomyModelId });

  console.log("3. Creating relational field: Product -> Taxonomy...");
  await graphqlRequest(`
    mutation CreateProductTaxonomyRelation($modelId: ID!, $otherModelId: ID!) {
      createRelationalField(data: {
        modelId: $modelId,
        type: RELATION,
        apiId: "taxonomies",
        displayName: "Taxonomies",
        isList: true,
        reverseSide: {
          modelId: $otherModelId,
          field: {
            apiId: "products",
            displayName: "Products",
            isList: true
          }
        }
      }) {
        migration { id }
      }
    }
  `, { modelId: productModelId, otherModelId: taxonomyModelId });

  console.log("4. Creating relational field: BlogPost -> Taxonomy...");
  await graphqlRequest(`
    mutation CreateBlogPostTaxonomyRelation($modelId: ID!, $otherModelId: ID!) {
      createRelationalField(data: {
        modelId: $modelId,
        type: RELATION,
        apiId: "taxonomies",
        displayName: "Taxonomies",
        isList: true,
        reverseSide: {
          modelId: $otherModelId,
          field: {
            apiId: "blogPosts",
            displayName: "Blog Posts",
            isList: true
          }
        }
      }) {
        migration { id }
      }
    }
  `, { modelId: blogPostModelId, otherModelId: taxonomyModelId });

  console.log("Done!");
}

main().catch(err => {
  console.error("FAILED:", err.message);
});
